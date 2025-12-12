const express = require('express');
const router = express.Router();
const membersService = require('../services/membersService');
const { verifyToken, requireAdmin, requireMember } = require('../middleware/auth');
const cognitoService = require('../services/cognitoService');
const emailService = require('../services/emailService');
const certificateService = require('../services/certificateService');
const memberDetailsPdfService = require('../services/memberDetailsPdfService');

// Get all members with optional filters and pagination
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
            paymentStatus: req.query.paymentStatus,
            status: req.query.status,
            q: req.query.q // Add search query to filters
        };

        // Check if pagination is requested
        const page = parseInt(req.query.page) || null;
        const limit = parseInt(req.query.limit) || 20;

        if (page) {
            // Return paginated results
            const result = await membersService.getPaginated(page, limit, filters);
            res.json(result);
        } else {
            // Return all members (backward compatibility)
            const members = await membersService.getAll(filters);
            res.json(members);
        }
    } catch (error) {
        next(error);
    }
});

// Check if email exists (public endpoint for signup validation)
router.get('/check-email', async (req, res, next) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const existingMember = await membersService.getByEmail(email);

        res.json({
            exists: !!existingMember,
            message: existingMember ? 'Email already registered' : 'Email available'
        });
    } catch (error) {
        next(error);
    }
});

// Get member counts (lightweight, optimized for dashboard)
router.get('/counts', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const filters = {
            membershipCategory: req.query.membershipCategory,
            membershipType: req.query.membershipType
        };
        const counts = await membersService.getCounts(filters);
        res.json(counts);
    } catch (error) {
        next(error);
    }
});

// Get member statistics (full stats with revenue calculations)
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

        // Include family members if this is a primary member or get primary member if this is a family member
        let familyMembers = [];
        let primaryMember = null;

        if (member.isPrimaryMember === true) {
            // Get all family members linked to this primary member
            familyMembers = await membersService.getFamilyMembers(member.id);
        } else if (member.linkedToMember) {
            // This is a family member, get the primary member
            primaryMember = await membersService.getPrimaryMember(member.linkedToMember);
            // Also get sibling family members
            familyMembers = await membersService.getFamilyMembers(member.linkedToMember);
            // Filter out the current member from siblings
            familyMembers = familyMembers.filter(fm => fm.id !== member.id);
        }

        res.json({
            ...member,
            familyMembers,
            primaryMember
        });
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

        // Check if any family member email already exists
        if (memberData.membershipType === 'family' && memberData.familyMembers && memberData.familyMembers.length > 0) {
            for (const familyMember of memberData.familyMembers) {
                const existingFamilyMember = await membersService.getByEmail(familyMember.email);
                if (existingFamilyMember) {
                    return res.status(409).json({
                        error: `A member with email ${familyMember.email} already exists`
                    });
                }
            }

            // Check for duplicate emails within the family members list
            const familyEmails = memberData.familyMembers.map(fm => fm.email.toLowerCase());
            const duplicates = familyEmails.filter((email, index) => familyEmails.indexOf(email) !== index);
            if (duplicates.length > 0) {
                return res.status(400).json({
                    error: `Duplicate email found in family members: ${duplicates[0]}`
                });
            }

            // Check if family member email is same as main member email
            if (familyEmails.includes(memberData.email.toLowerCase())) {
                return res.status(400).json({
                    error: 'Family member email cannot be the same as the main member email'
                });
            }
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
            memberData.membershipType,
            memberData.paymentType || 'full'
        );

        // Prepare member data for database (NEVER save passwords)
        const memberToSave = {
            ...memberData,
            membershipFee,
            paymentStatus: memberData.paymentIntentId ? 'processing' : 'pending',
            status: 'pending_approval', // Requires admin approval
            isPrimaryMember: memberData.membershipType === 'family' ? true : null, // Mark as primary if family membership
            password: undefined, // Don't save password in database
            confirmPassword: undefined // Don't save confirm password either
        };

        // Create member in database
        const newMember = await membersService.create(memberToSave);

        // Create individual member records for each family member
        const familyMemberRecords = [];
        if (memberData.membershipType === 'family' && memberData.familyMembers && memberData.familyMembers.length > 0) {
            for (const familyMember of memberData.familyMembers) {
                try {
                    const familyMemberData = {
                        firstName: familyMember.firstName,
                        lastName: familyMember.lastName,
                        email: familyMember.email,
                        mobile: familyMember.mobile,
                        age: familyMember.age,
                        gender: '', // Can be added later or left empty
                        membershipCategory: memberData.membershipCategory,
                        membershipType: 'family', // Family members maintain family type
                        membershipFee: 0, // No additional fee, covered by family membership
                        paymentStatus: 'succeeded', // Covered by main member's payment
                        status: 'pending_approval',
                        residentialAddress: memberData.residentialAddress,
                        postalAddress: memberData.postalAddress,
                        sameAsResidential: memberData.sameAsResidential,
                        acceptDeclaration: true,
                        comments: `Family member of ${memberData.firstName} ${memberData.lastName} (${newMember.referenceNo}). Relationship: ${familyMember.relationship}`,
                        linkedToMember: newMember.id, // Link to main member
                        linkedMemberReferenceNo: newMember.referenceNo,
                        relationship: familyMember.relationship, // Store relationship
                        isPrimaryMember: false // Mark as dependent family member
                    };

                    const createdFamilyMember = await membersService.create(familyMemberData);
                    familyMemberRecords.push(createdFamilyMember);
                    console.log(`✅ Created family member record: ${createdFamilyMember.email} (${createdFamilyMember.referenceNo})`);

                    // Create Cognito user for family member if email is provided and valid
                    if (familyMember.email && familyMember.email.includes('@') && cognitoService.isConfigured()) {
                        try {
                            // Generate a temporary password for family member
                            const tempPassword = cognitoService.generateTemporaryPassword();

                            console.log(`Creating Cognito user for family member: ${familyMember.email}`);
                            const familyCognitoResult = await cognitoService.createUser({
                                email: familyMember.email,
                                password: tempPassword,
                                firstName: familyMember.firstName,
                                lastName: familyMember.lastName,
                                phone: familyMember.mobile,
                                membershipType: memberData.membershipCategory,
                                membershipCategory: 'family',
                                memberId: createdFamilyMember.referenceNo
                            }, false); // false = disabled by default, requires admin approval

                            console.log(`✅ Cognito user created for family member: ${familyMember.email}`);

                            // Update family member with Cognito user ID
                            await membersService.update(createdFamilyMember.id, {
                                cognitoUserId: familyCognitoResult.userSub,
                                cognitoEnabled: familyCognitoResult.cognitoEnabled,
                                status: familyCognitoResult.status
                            });
                        } catch (familyCognitoError) {
                            console.error(`⚠️ Failed to create Cognito user for family member ${familyMember.email}:`, familyCognitoError.message);
                            // Continue even if Cognito creation fails
                        }
                    }
                } catch (familyError) {
                    console.error(`⚠️ Failed to create family member record for ${familyMember.email}:`, familyError.message);
                    // Continue with other family members even if one fails
                }
            }
        }

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

        // Send notification email to admin
        try {
            await emailService.sendNewMemberNotificationToAdmin({
                firstName: newMember.firstName,
                lastName: newMember.lastName,
                email: newMember.email,
                phone: newMember.mobile,
                referenceNo: newMember.referenceNo,
                membershipType: newMember.membershipType,
                membershipCategory: newMember.membershipCategory,
                address: newMember.address,
                suburb: newMember.suburb,
                state: newMember.state,
                postcode: newMember.postcode,
                familyMembers: familyMemberRecords
            });
            console.log('✅ Admin notification email sent for new member:', newMember.email);
        } catch (emailError) {
            // Don't fail registration if email fails
            console.error('⚠️ Failed to send admin notification email:', emailError.message);
        }

        // Return response without password fields
        const { password, confirmPassword, ...memberResponse } = newMember;

        const responseMessage = memberData.membershipType === 'family' && familyMemberRecords.length > 0
            ? `Registration successful. ${familyMemberRecords.length} family member(s) have been registered as individual members. All accounts are pending admin approval. You will receive an email once approved.`
            : 'Registration successful. Your account is pending admin approval. You will receive an email once approved.';

        res.status(201).json({
            success: true,
            member: memberResponse,
            familyMembers: familyMemberRecords.map(fm => ({
                id: fm.id,
                referenceNo: fm.referenceNo,
                firstName: fm.firstName,
                lastName: fm.lastName,
                email: fm.email
            })),
            message: responseMessage,
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
                memberData.membershipType,
                memberData.paymentType || 'full'
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

        // Update or create Cognito user
        if (cognitoService.isConfigured()) {
            try {
                const cognitoUser = await cognitoService.getUser(oldEmail);

                if (cognitoUser) {
                    // User exists - update attributes
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
                    // User doesn't exist - create new Cognito user if member is active/approved
                    if (updatedMember.status === 'active' && isAdmin) {
                        console.log(`🔐 Creating new Cognito user for member: ${updatedMember.email}`);

                        // Generate temporary password
                        const tempPassword = cognitoService.generateTemporaryPassword();

                        const cognitoResult = await cognitoService.createUser({
                            email: updatedMember.email,
                            password: tempPassword,
                            firstName: updatedMember.firstName,
                            lastName: updatedMember.lastName,
                            phone: updatedMember.mobile,
                            membershipType: updatedMember.membershipCategory,
                            membershipCategory: updatedMember.membershipType,
                            memberId: updatedMember.referenceNo
                        }, true, 'member', false, false); // enabled=true, userType=member, forceReset=false, sendEmail=false

                        // Update member with Cognito user ID
                        await membersService.update(id, {
                            cognitoUserId: cognitoResult.userSub,
                            cognitoEnabled: true
                        });

                        console.log(`✅ Cognito user created for: ${updatedMember.email}`);
                        console.log(`📧 Temporary password: ${tempPassword}`);

                        // TODO: Send welcome email with temporary password
                    } else {
                        console.log(`⚠️ No Cognito user found for: ${oldEmail}, skipping Cognito creation (member status: ${updatedMember.status})`);
                    }
                }
            } catch (cognitoError) {
                // Log the error but don't fail the entire update
                console.error('❌ Error syncing Cognito user:', cognitoError);
                console.log('⚠️ Member data updated in DynamoDB but Cognito sync failed');
            }
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
                    // User exists, enable them and ensure they're in the correct group
                    console.log('Enabling existing Cognito user:', member.email);
                    await cognitoService.enableUser(member.email);

                    // Ensure user is in AnmcMembers group (in case it failed during registration)
                    await cognitoService.addToAnmcMembersGroup(member.email);
                    console.log(`✅ Ensured ${member.email} is in AnmcMembers group`);

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

        // If this is a primary family member, approve and enable all linked family members
        const familyMembersApproved = [];
        if (member.isPrimaryMember === true) {
            try {
                const familyMembers = await membersService.getFamilyMembers(id);
                console.log(`Found ${familyMembers.length} family members to approve`);

                for (const familyMember of familyMembers) {
                    try {
                        // Enable Cognito user for family member if exists
                        if (familyMember.email && familyMember.cognitoUserId && cognitoService.isConfigured()) {
                            await cognitoService.enableUser(familyMember.email);
                            await cognitoService.addToAnmcMembersGroup(familyMember.email);
                            console.log(`✅ Enabled Cognito user for family member: ${familyMember.email}`);
                        }

                        // Update family member status
                        await membersService.update(familyMember.id, {
                            status: 'active',
                            approvedAt: new Date().toISOString(),
                            approvedBy: req.body.approvedBy || 'admin',
                            cognitoEnabled: true
                        });

                        familyMembersApproved.push(familyMember.email);

                        // Send approval email to family member
                        try {
                            await emailService.sendMemberApprovalEmail({
                                email: familyMember.email,
                                firstName: familyMember.firstName,
                                lastName: familyMember.lastName,
                                referenceNo: familyMember.referenceNo
                            });
                        } catch (emailError) {
                            console.error(`⚠️ Failed to send approval email to family member ${familyMember.email}:`, emailError.message);
                        }
                    } catch (familyApprovalError) {
                        console.error(`⚠️ Failed to approve family member ${familyMember.email}:`, familyApprovalError.message);
                        // Continue with other family members
                    }
                }
            } catch (familyError) {
                console.error('⚠️ Failed to process family members:', familyError.message);
                // Continue even if family member processing fails
            }
        }

        res.json({
            success: true,
            message: cognitoResult?.created
                ? 'Member approved successfully. Cognito user created and enabled. User can now login.'
                : 'Member approved successfully. User can now login.',
            member: updatedMember,
            cognitoStatus: cognitoResult,
            familyMembersApproved: familyMembersApproved.length > 0 ? familyMembersApproved : undefined
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

                // Ensure user is in AnmcMembers group (in case it was never assigned)
                await cognitoService.addToAnmcMembersGroup(member.email);
                console.log(`✅ Ensured ${member.email} is in AnmcMembers group`);
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

// Renew membership
router.post('/:id/renew', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentIntentId, paymentStatus } = req.body;

        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Prevent renewing life memberships
        if (member.membershipCategory === 'life') {
            return res.status(400).json({
                error: 'Life memberships do not require renewal as they never expire'
            });
        }

        // Calculate renewal fee
        const renewalFee = membersService.calculateMembershipFee(
            member.membershipCategory,
            member.membershipType,
            'full' // Renewals are always full payment
        );

        // Prepare payment data if payment info provided
        const paymentData = {};
        if (paymentIntentId) {
            paymentData.paymentIntentId = paymentIntentId;
            paymentData.paymentStatus = paymentStatus || 'processing';
            paymentData.membershipFee = renewalFee;
            paymentData.paymentDate = new Date().toISOString();
        }

        // Renew membership
        const renewedMember = await membersService.renewMembership(id, paymentData);

        console.log(`✅ Membership renewed for: ${member.email} (${member.referenceNo})`);
        console.log(`   New expiry date: ${renewedMember.expiryDate}`);

        res.json({
            success: true,
            message: 'Membership renewed successfully',
            member: renewedMember,
            renewalFee,
            newExpiryDate: renewedMember.expiryDate
        });
    } catch (error) {
        if (error.message === 'Member not found' || error.message.includes('Life memberships')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

// Get members expiring soon (within 30 days)
router.get('/expiring/soon', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const members = await membersService.getAll();
        const now = new Date();

        const expiringSoon = members.filter(m => {
            if (!m.expiryDate || m.membershipCategory === 'life') return false;
            const expiryDate = new Date(m.expiryDate);
            const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        });

        res.json({
            success: true,
            count: expiringSoon.length,
            members: expiringSoon.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
        });
    } catch (error) {
        next(error);
    }
});

// Get expired members
router.get('/expired/list', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const members = await membersService.getAll();

        const expired = members.filter(m => membersService.isMembershipExpired(m));

        res.json({
            success: true,
            count: expired.length,
            members: expired.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
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

// Fix Cognito group for a specific member (admin utility endpoint)
router.post('/:id/fix-cognito-group', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (!member.email) {
            return res.status(400).json({ error: 'Member has no email address' });
        }

        if (!cognitoService.isConfigured()) {
            return res.status(500).json({ error: 'Cognito is not configured' });
        }

        // Check if Cognito user exists
        const cognitoUser = await cognitoService.getUser(member.email);
        if (!cognitoUser) {
            return res.status(404).json({
                error: 'Cognito user not found',
                message: 'This member does not have a Cognito account. Please approve them first with a password.'
            });
        }

        // Add user to AnmcMembers group
        await cognitoService.addToAnmcMembersGroup(member.email);

        // Ensure user is enabled if status is active
        if (member.status === 'active') {
            await cognitoService.enableUser(member.email);
        }

        console.log(`✅ Fixed Cognito group for member: ${member.email}`);

        res.json({
            success: true,
            message: `Successfully added ${member.email} to AnmcMembers group`,
            member: {
                id: member.id,
                email: member.email,
                membershipCategory: member.membershipCategory,
                status: member.status
            }
        });
    } catch (error) {
        console.error('Error fixing Cognito group:', error);
        next(error);
    }
});

// Bulk fix Cognito groups for all active members (admin utility endpoint)
router.post('/fix-all-cognito-groups', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        if (!cognitoService.isConfigured()) {
            return res.status(500).json({ error: 'Cognito is not configured' });
        }

        const members = await membersService.getAll({ status: 'active' });
        const results = {
            success: [],
            failed: [],
            skipped: []
        };

        for (const member of members) {
            if (!member.email) {
                results.skipped.push({ id: member.id, reason: 'No email' });
                continue;
            }

            try {
                // Check if Cognito user exists
                const cognitoUser = await cognitoService.getUser(member.email);
                if (!cognitoUser) {
                    results.skipped.push({ id: member.id, email: member.email, reason: 'No Cognito account' });
                    continue;
                }

                // Add to AnmcMembers group
                await cognitoService.addToAnmcMembersGroup(member.email);

                // Ensure user is enabled
                await cognitoService.enableUser(member.email);

                results.success.push({ id: member.id, email: member.email });
                console.log(`✅ Fixed: ${member.email}`);
            } catch (error) {
                results.failed.push({ id: member.id, email: member.email, error: error.message });
                console.error(`❌ Failed: ${member.email} - ${error.message}`);
            }
        }

        console.log(`\n📊 Bulk fix complete: ${results.success.length} success, ${results.failed.length} failed, ${results.skipped.length} skipped`);

        res.json({
            success: true,
            message: 'Bulk Cognito group fix completed',
            results
        });
    } catch (error) {
        console.error('Error in bulk fix:', error);
        next(error);
    }
});

// Generate certificate for a member
router.get('/:id/certificate', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get member data
        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Generate certificate
        const pdfBuffer = await certificateService.generateMembershipCertificate(member);
        const filename = certificateService.getCertificateFilename(member);

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating certificate:', error);
        next(error);
    }
});

// Generate member details PDF
router.get('/:id/details-pdf', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get member data with family members
        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Generate member details PDF
        const pdfBuffer = await memberDetailsPdfService.generateMemberDetailsPdf(member);
        const filename = memberDetailsPdfService.getMemberDetailsFilename(member);

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating member details PDF:', error);
        next(error);
    }
});

// PATCH route for partial updates (supports both ID and referenceNo)
// NOTE: This must be at the end to avoid conflicting with specific routes like /:id/payment-status
router.patch('/:idOrRef', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { idOrRef } = req.params;
        const memberData = req.body;
        let member = null;

        console.log('PATCH update member:', idOrRef);
        console.log('Update data:', JSON.stringify(memberData, null, 2));

        // Try to get member by numeric ID first
        if (!isNaN(idOrRef)) {
            console.log('Trying numeric ID lookup:', parseInt(idOrRef));
            member = await membersService.getById(parseInt(idOrRef));
            if (member) {
                console.log('✅ Found member by numeric ID:', member.id);
            }
        }

        // If not found and looks like a referenceNo (starts with ANMC), search by referenceNo
        if (!member && idOrRef.startsWith('ANMC')) {
            console.log('Trying referenceNo lookup:', idOrRef);
            const allMembers = await membersService.getAll({});
            console.log(`📊 Total members fetched: ${allMembers.length}`);

            member = allMembers.find(m => m.referenceNo === idOrRef);
            if (member) {
                console.log('✅ Found member by referenceNo:', member.referenceNo, 'ID:', member.id);
            } else {
                console.log('❌ Member not found. Available referenceNos:',
                    allMembers.slice(0, 5).map(m => m.referenceNo).join(', '), '...');
            }
        }

        if (!member) {
            console.log('❌ Member not found for:', idOrRef);
            return res.status(404).json({ error: 'Member not found' });
        }

        // Check if user is admin or updating their own data
        const isAdmin = req.user.groups.includes('Admin') ||
                      req.user.groups.includes('ANMCMembers') ||
                      req.user.groups.includes('AnmcAdmins') ||
                      req.user.groups.includes('AnmcManagers');

        // Members can only update their own data
        if (!isAdmin && member.email !== req.user.email) {
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

        const emailChanged = memberData.email && memberData.email !== member.email;
        const oldEmail = member.email;

        // Update member in DynamoDB using the member's actual ID
        const updatedMember = await membersService.update(member.id, memberData);

        // Update or create Cognito user
        if (cognitoService.isConfigured()) {
            try {
                const cognitoUser = await cognitoService.getUser(oldEmail);

                if (cognitoUser) {
                    // User exists - update attributes
                    const cognitoAttributes = {};

                    // Update first name
                    if (memberData.firstName && memberData.firstName !== member.firstName) {
                        cognitoAttributes.given_name = memberData.firstName;
                    }

                    // Update last name
                    if (memberData.lastName && memberData.lastName !== member.lastName) {
                        cognitoAttributes.family_name = memberData.lastName;
                    }

                    // Update phone number
                    if (memberData.mobile && memberData.mobile !== member.mobile) {
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
                    // User doesn't exist - create new Cognito user if member is active/approved
                    if (updatedMember.status === 'active' && isAdmin) {
                        console.log(`🔐 Creating new Cognito user for member: ${updatedMember.email}`);

                        // Generate temporary password
                        const tempPassword = cognitoService.generateTemporaryPassword();

                        const cognitoResult = await cognitoService.createUser({
                            email: updatedMember.email,
                            password: tempPassword,
                            firstName: updatedMember.firstName,
                            lastName: updatedMember.lastName,
                            phone: updatedMember.mobile,
                            membershipType: updatedMember.membershipCategory,
                            membershipCategory: updatedMember.membershipType,
                            memberId: updatedMember.referenceNo
                        }, true, 'member', false, false); // enabled=true, userType=member, forceReset=false, sendEmail=false

                        // Update member with Cognito user ID
                        await membersService.update(member.id, {
                            cognitoUserId: cognitoResult.userSub,
                            cognitoEnabled: true
                        });

                        console.log(`✅ Cognito user created for: ${updatedMember.email}`);
                        console.log(`📧 Temporary password: ${tempPassword}`);

                        // TODO: Send welcome email with temporary password
                    } else {
                        console.log(`⚠️ No Cognito user found for: ${oldEmail}, skipping Cognito creation (member status: ${updatedMember.status})`);
                    }
                }
            } catch (cognitoError) {
                // Log the error but don't fail the entire update
                console.error('❌ Error syncing Cognito user:', cognitoError);
                console.log('⚠️ Member data updated in DynamoDB but Cognito sync failed');
            }
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

module.exports = router;
