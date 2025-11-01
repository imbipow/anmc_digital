const express = require('express');
const router = express.Router();
const membersService = require('../services/membersService');
const cognitoService = require('../services/cognitoService');

// Get all members with optional filters
router.get('/', async (req, res, next) => {
    try {
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
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await membersService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Search members
router.get('/search', async (req, res, next) => {
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
router.get('/category/:category', async (req, res, next) => {
    try {
        const { category } = req.params;
        const members = await membersService.getAll({ membershipCategory: category });
        res.json(members);
    } catch (error) {
        next(error);
    }
});

// Get members by type
router.get('/type/:type', async (req, res, next) => {
    try {
        const { type } = req.params;
        const members = await membersService.getAll({ membershipType: type });
        res.json(members);
    } catch (error) {
        next(error);
    }
});

// Get single member
router.get('/:id', async (req, res, next) => {
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

// Register new member (with Cognito integration)
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

        // Prepare member data for database
        const memberToSave = {
            ...memberData,
            membershipFee,
            paymentStatus: memberData.paymentIntentId ? 'processing' : 'pending',
            password: undefined // Don't save password in database
        };

        // Create member in database
        const newMember = await membersService.create(memberToSave);

        // Create user in Cognito if password is provided
        let cognitoResult = null;
        if (memberData.password && cognitoService.isConfigured()) {
            try {
                cognitoResult = await cognitoService.createUser({
                    email: memberData.email,
                    password: memberData.password,
                    firstName: memberData.firstName,
                    lastName: memberData.lastName,
                    phone: memberData.mobile,
                    membershipType: memberData.membershipCategory
                });

                // Update member with Cognito user ID
                await membersService.update(newMember.id, {
                    cognitoUserId: cognitoResult.userSub,
                    cognitoEnabled: cognitoResult.cognitoEnabled
                });
            } catch (cognitoError) {
                console.error('Cognito user creation failed:', cognitoError);
                // Continue with registration even if Cognito fails
                // User can be added to Cognito later manually
            }
        }

        res.status(201).json({
            success: true,
            member: newMember,
            message: 'Registration successful',
            cognitoEnabled: cognitoResult?.cognitoEnabled || false
        });
    } catch (error) {
        next(error);
    }
});

// Create new member (admin)
router.post('/', async (req, res, next) => {
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
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const memberData = req.body;

        const updatedMember = await membersService.update(id, memberData);
        res.json(updatedMember);
    } catch (error) {
        if (error.message === 'Member not found') {
            return res.status(404).json({ error: error.message });
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

// Delete member
router.delete('/:id', async (req, res, next) => {
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
