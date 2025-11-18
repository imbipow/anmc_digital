const express = require('express');
const router = express.Router();
const membersService = require('../services/membersService');
const { verifyToken, requireAdmin, requireMember } = require('../middleware/auth');
const cognitoService = require('../services/cognitoService');
const emailService = require('../services/emailService');

// Get all members with optional filters
// Members can view their own data by email, admins can view all
router.get('/', verifyToken, requireMember, async (req, res, next) => {
    try {
        // If email is provided, check if it's the user's own email or if user is admin
        if (req.query.email) {
            const isAdmin = req.user.groups.includes('Admin') ||
                          req.user.groups.includes('ANMCMembers') ||
                          req.user.groups.includes('AnmcAdmins') ||
                          req.user.groups.includes('AnmcManagers');

            // Members can only view their own data
            if (!isAdmin && req.query.email !== req.user.email) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You can only access your own member data'
                });
            }

            const member = await membersService.getByEmail(req.query.email);
            return res.json(member ? [member] : []);
        }

        // Listing all members requires admin access
        const isAdmin = req.user.groups.includes('Admin') ||
                      req.user.groups.includes('ANMCMembers') ||
                      req.user.groups.includes('AnmcAdmins') ||
                      req.user.groups.includes('AnmcManagers');

        if (!isAdmin) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Admin access required to view all members'
            });
        }

        const filters = {
            membershipCategory: req.query.membershipCategory,
            membershipType: req.query.membershipType,
            paymentStatus: req.query.paymentStatus
        };

        const members = await membersService.getAll(filters);
        res.json(members);
    } catch (error) {
        next(error);
    }
});

// Get member statistics
router.get('/stats', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const stats = await membersService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Search members
router.get('/search', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const results = await membersService.search(q);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Get members by category
router.get('/category/:category', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { category } = req.params;
        const members = await membersService.getAll({ membershipCategory: category });
        res.json(members);
    } catch (error) {
        next(error);
    }
});

// Get members by type
router.get('/type/:type', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { type } = req.params;
        const members = await membersService.getAll({ membershipType: type });
        res.json(members);
    } catch (error) {
        next(error);
    }
});

// Get single member
router.get('/:id', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json(member);
    } catch (error) {
        next(error);
    }
});

// Register new member (with Cognito integration) - PUBLIC ENDPOINT
router.post('/register', async (req, res, next) => {
    try {
        const memberData = req.body;

        // Validate member data
        const validation = membersService.validateMemberData(memberData);
        if (!validation.isValid) {
            return res.status(400).json({
                error: 'Validation failed',
                errors: validation.errors
            });
        }

        // Check if email already exists
        const existingMember = await membersService.getByEmail(memberData.email);
        if (existingMember) {
            return res.status(409).json({
                error: 'A member with this email already exists'
            });
        }

        // Validate password if provided
        if (memberData.password) {
            const passwordValidation = cognitoService.validatePassword(memberData.password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    error: 'Password validation failed',
                    errors: passwordValidation.errors
                });
            }
        }

        // Calculate membership fee
        const membershipFee = membersService.calculateMembershipFee(
            memberData.membershipCategory,
            memberData.membershipType
        );

        // Prepare member data for database (NEVER save passwords)
        const memberToSave = {
            ...memberData,
            membershipFee,
            paymentStatus: memberData.paymentIntentId ? 'processing' : 'pending',
            status: 'pending_approval', // Requires admin approval
            password: undefined, // Don't save password in database
            confirmPassword: undefined // Don't save confirm password either
        };

        // Create member in database
        const newMember = await membersService.create(memberToSave);

        // Create user in Cognito if password is provided (disabled by default)
        let cognitoResult = null;
        console.log('Checking Cognito creation:', {
            hasPassword: !!memberData.password,
            isConfigured: cognitoService.isConfigured(),
            email: memberData.email
        });

        if (memberData.password && cognitoService.isConfigured()) {
            try {
                console.log('Creating Cognito user for:', memberData.email);
                cognitoResult = await cognitoService.createUser({
                    email: memberData.email,
                    password: memberData.password,
                    firstName: memberData.firstName,
                    lastName: memberData.lastName,
                    phone: memberData.mobile,
                    membershipType: memberData.membershipCategory,
                    membershipCategory: memberData.membershipType,
                    memberId: newMember.referenceNo
                }, false); // false = disabled by default, requires admin approval

                console.log('Cognito user created successfully:', cognitoResult);

                // Update member with Cognito user ID and status
                await membersService.update(newMember.id, {
                    cognitoUserId: cognitoResult.userSub,
                    cognitoEnabled: cognitoResult.cognitoEnabled,
                    status: cognitoResult.status // 'pending_approval'
                });
            } catch (cognitoError) {
                console.error('Cognito user creation failed:', cognitoError);
                console.error('Cognito error stack:', cognitoError.stack);
                // Continue with registration even if Cognito fails
                // User can be added to Cognito later manually
            }
        } else {
            console.log('Skipping Cognito creation - Password:', !!memberData.password, 'Configured:', cognitoService.isConfigured());
        }

        // Send welcome email to member
        try {
            await emailService.sendMemberWelcomeEmail({
                email: newMember.email,
                firstName: newMember.firstName,
                lastName: newMember.lastName,
                referenceNo: newMember.referenceNo
            });
            console.log('✅ Welcome email sent to:', newMember.email);
        } catch (emailError) {
            // Don't fail registration if email fails
            console.error('⚠️ Failed to send welcome email:', emailError.message);
        }

        // Return response without password fields
        const { password, confirmPassword, ...memberResponse } = newMember;

        res.status(201).json({
            success: true,
            member: memberResponse,
            message: 'Registration successful. Your account is pending admin approval. You will receive an email once approved.',
            cognitoEnabled: cognitoResult?.cognitoEnabled || false,
            cognitoCreated: !!cognitoResult,
            requiresApproval: true,
            status: 'pending_approval'
        });
    } catch (error) {
        next(error);
    }
});

// Create new member (admin)
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const memberData = req.body;

        // Validate member data
        const validation = membersService.validateMemberData(memberData);
        if (!validation.isValid) {
            return res.status(400).json({
                error: 'Validation failed',
                errors: validation.errors
            });
        }

        // Calculate membership fee if not provided
        if (!memberData.membershipFee) {
            memberData.membershipFee = membersService.calculateMembershipFee(
                memberData.membershipCategory,
                memberData.membershipType
            );
        }

        const newMember = await membersService.create(memberData);
        res.status(201).json(newMember);
    } catch (error) {
        next(error);
    }
});

// Update member
// Members can update their own data, admins can update any member
router.put('/:id', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { id } = req.params;
        const memberData = req.body;

        console.log('Updating member:', id);
        console.log('Update data:', JSON.stringify(memberData, null, 2));

        // Get the existing member first to check permissions and email changes
        const existingMember = await membersService.getById(id);
        if (!existingMember) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Check if user is admin or updating their own data
        const isAdmin = req.user.groups.includes('Admin') ||
                      req.user.groups.includes('ANMCMembers') ||
                      req.user.groups.includes('AnmcAdmins') ||
                      req.user.groups.includes('AnmcManagers');

        // Members can only update their own data
        if (!isAdmin && existingMember.email !== req.user.email) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only update your own member data'
            });
        }

        // If not admin, restrict which fields can be updated
        if (!isAdmin) {
            const allowedFields = ['firstName', 'lastName', 'email', 'mobile', 'residentialAddress'];
            const requestedFields = Object.keys(memberData);
            const unauthorizedFields = requestedFields.filter(field => !allowedFields.includes(field));

            if (unauthorizedFields.length > 0) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: `Members can only update these fields: ${allowedFields.join(', ')}. Unauthorized fields: ${unauthorizedFields.join(', ')}`
                });
            }
        }

        const emailChanged = memberData.email && memberData.email !== existingMember.email;
        const oldEmail = existingMember.email;

        // Update member in DynamoDB
        const updatedMember = await membersService.update(id, memberData);

        // Update Cognito user attributes if user exists in Cognito
        try {
            const cognitoUser = await cognitoService.getUser(oldEmail);

            if (cognitoUser) {
                const cognitoAttributes = {};

                // Update first name
                if (memberData.firstName && memberData.firstName !== existingMember.firstName) {
                    cognitoAttributes.given_name = memberData.firstName;
                }

                // Update last name
                if (memberData.lastName && memberData.lastName !== existingMember.lastName) {
                    cognitoAttributes.family_name = memberData.lastName;
                }

                // Update phone number
                if (memberData.mobile && memberData.mobile !== existingMember.mobile) {
                    let formattedPhone = memberData.mobile;
                    if (memberData.mobile.startsWith('04')) {
                        formattedPhone = '+61' + memberData.mobile.substring(1);
                    } else if (!memberData.mobile.startsWith('+')) {
                        formattedPhone = '+61' + memberData.mobile;
                    }
                    cognitoAttributes.phone_number = formattedPhone;
                }

                // Update email - set as unverified to trigger verification
                if (emailChanged) {
                    cognitoAttributes.email = memberData.email;
                    cognitoAttributes.email_verified = 'false'; // Require re-verification
                    console.log(`📧 Email changed from ${oldEmail} to ${memberData.email}, verification required`);
                }

                // Update Cognito attributes if there are any changes
                if (Object.keys(cognitoAttributes).length > 0) {
                    await cognitoService.updateUserAttributes(oldEmail, cognitoAttributes);
                    console.log(`✅ Cognito user attributes updated for: ${oldEmail}`);
                }
            } else {
                console.log(`⚠️ No Cognito user found for: ${oldEmail}, skipping Cognito update`);
            }
        } catch (cognitoError) {
            // Log the error but don't fail the entire update
            console.error('❌ Error updating Cognito user:', cognitoError);
            console.log('⚠️ Member data updated in DynamoDB but Cognito sync failed');
        }

        res.json({
            ...updatedMember,
            emailVerificationRequired: emailChanged
        });
    } catch (error) {
        console.error('Error updating member:', error);
        if (error.message === 'Member not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'ValidationException') {
            return res.status(400).json({
                error: 'Validation error',
                details: error.message
            });
        }
        next(error);
    }
});

// Update payment status
router.patch('/:id/payment-status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentStatus, paymentIntentId } = req.body;

        if (!paymentStatus) {
            return res.status(400).json({ error: 'Payment status is required' });
        }

        const updatedMember = await membersService.update(id, {
            paymentStatus,
            paymentIntentId,
            paymentDate: paymentStatus === 'succeeded' ? new Date().toISOString() : undefined
        });

        res.json(updatedMember);
    } catch (error) {
        next(error);
    }
});

// Approve member (enable Cognito user)
router.post('/:id/approve', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password } = req.body; // Optional: provide password if creating new user
        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        let cognitoResult = null;

        // Handle Cognito user
        if (member.email && cognitoService.isConfigured()) {
            try {
                // First, try to get the user to see if they exist
                const existingUser = await cognitoService.getUser(member.email);

                if (existingUser) {
                    // User exists, just enable them
                    console.log('Enabling existing Cognito user:', member.email);
                    await cognitoService.enableUser(member.email);
                    cognitoResult = { userExists: true, created: false };
                } else {
                    // User doesn't exist, create them
                    console.log('Cognito user not found, creating new user:', member.email);

                    if (!password) {
                        return res.status(400).json({
                            error: 'Cognito user does not exist. Please provide a password to create the user.',
                            requiresPassword: true
                        });
                    }

                    // Validate password
                    const passwordValidation = cognitoService.validatePassword(password);
                    if (!passwordValidation.isValid) {
                        return res.status(400).json({
                            error: 'Password validation failed',
                            errors: passwordValidation.errors
                        });
                    }

                    // Create the Cognito user
                    cognitoResult = await cognitoService.createUser({
                        email: member.email,
                        password: password,
                        firstName: member.firstName,
                        lastName: member.lastName,
                        phone: member.mobile,
                        membershipType: member.membershipCategory,
                        membershipCategory: member.membershipType,
                        memberId: member.referenceNo
                    }, true); // true = enabled by default since we're approving

                    // Update member with Cognito user ID
                    await membersService.update(id, {
                        cognitoUserId: cognitoResult.userSub,
                        cognitoEnabled: true
                    });

                    cognitoResult = { userExists: false, created: true };
                }
            } catch (cognitoError) {
                console.error('Failed to handle Cognito user:', cognitoError);
                return res.status(500).json({
                    error: 'Failed to approve member in authentication system',
                    details: cognitoError.message,
                    suggestion: 'Try providing a password in the request body to create the Cognito user'
                });
            }
        }

        // Update member status in database
        const updatedMember = await membersService.update(id, {
            status: 'active',
            approvedAt: new Date().toISOString(),
            approvedBy: req.body.approvedBy || 'admin'
        });

        // Send approval email to member
        try {
            await emailService.sendMemberApprovalEmail({
                email: updatedMember.email,
                firstName: updatedMember.firstName,
                lastName: updatedMember.lastName,
                referenceNo: updatedMember.referenceNo
            });
            console.log('✅ Approval email sent to:', updatedMember.email);
        } catch (emailError) {
            // Don't fail approval if email fails
            console.error('⚠️ Failed to send approval email:', emailError.message);
        }

        res.json({
            success: true,
            message: cognitoResult?.created
                ? 'Member approved successfully. Cognito user created and enabled. User can now login.'
                : 'Member approved successfully. User can now login.',
            member: updatedMember,
            cognitoStatus: cognitoResult
        });
    } catch (error) {
        next(error);
    }
});

// Reject member (keep Cognito user disabled)
router.post('/:id/reject', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Update member status in database
        const updatedMember = await membersService.update(id, {
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectedBy: req.body.rejectedBy || 'admin',
            rejectionReason: reason
        });

        // Note: Cognito user remains disabled, could be deleted if needed
        // await cognitoService.deleteUser(member.email); // Optional

        res.json({
            success: true,
            message: 'Member registration rejected.',
            member: updatedMember
        });
    } catch (error) {
        next(error);
    }
});

// Suspend member (disable Cognito user)
router.post('/:id/suspend', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Disable user in Cognito
        if (member.email && cognitoService.isConfigured()) {
            try {
                await cognitoService.disableUser(member.email);
            } catch (cognitoError) {
                console.error('Failed to disable Cognito user:', cognitoError);
            }
        }

        // Update member status in database
        const updatedMember = await membersService.update(id, {
            status: 'suspended',
            suspendedAt: new Date().toISOString(),
            suspendedBy: req.body.suspendedBy || 'admin',
            suspensionReason: reason
        });

        res.json({
            success: true,
            message: 'Member suspended successfully. User cannot login.',
            member: updatedMember
        });
    } catch (error) {
        next(error);
    }
});

// Reactivate member (enable Cognito user)
router.post('/:id/reactivate', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Enable user in Cognito
        if (member.email && cognitoService.isConfigured()) {
            try {
                await cognitoService.enableUser(member.email);
            } catch (cognitoError) {
                console.error('Failed to enable Cognito user:', cognitoError);
            }
        }

        // Update member status in database
        const updatedMember = await membersService.update(id, {
            status: 'active',
            reactivatedAt: new Date().toISOString(),
            reactivatedBy: req.body.reactivatedBy || 'admin'
        });

        res.json({
            success: true,
            message: 'Member reactivated successfully. User can now login.',
            member: updatedMember
        });
    } catch (error) {
        next(error);
    }
});

// Delete member
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        await membersService.delete(id);
        res.json({ success: true, message: 'Member deleted successfully' });
    } catch (error) {
        if (error.message === 'Member not found') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
});

module.exports = router;
