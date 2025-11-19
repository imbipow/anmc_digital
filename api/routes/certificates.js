const express = require('express');
const router = express.Router();
const membersService = require('../services/membersService');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Generate membership certificate data
router.get('/member/:id', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const member = await membersService.getById(id);

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Only generate certificates for approved/active members
        if (member.status !== 'active' && member.status !== 'pending_approval') {
            return res.status(400).json({
                error: 'Certificate can only be generated for active or approved members'
            });
        }

        // Prepare certificate data
        const certificateData = {
            referenceNo: member.referenceNo,
            memberName: `${member.firstName} ${member.lastName}`,
            membershipCategory: member.membershipCategory,
            membershipType: member.membershipType,
            membershipStartDate: member.membershipStartDate || member.createdAt,
            expiryDate: member.expiryDate,
            issueDate: new Date().toISOString(),
            memberEmail: member.email,
            memberMobile: member.mobile,
            isPrimaryMember: member.isPrimaryMember,
            linkedMemberReferenceNo: member.linkedMemberReferenceNo,
            relationship: member.relationship
        };

        // If this is a family membership, include family members
        if (member.isPrimaryMember === true) {
            const familyMembers = await membersService.getFamilyMembers(member.id);
            certificateData.familyMembers = familyMembers.map(fm => ({
                name: `${fm.firstName} ${fm.lastName}`,
                relationship: fm.relationship,
                referenceNo: fm.referenceNo
            }));
        }

        res.json({
            success: true,
            certificate: certificateData
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
