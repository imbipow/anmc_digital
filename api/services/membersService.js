const dynamoDBService = require('./dynamodb');
const config = require('../config');

class MembersService {
    constructor() {
        this.tableName = config.tables.members;
    }

    // Generate unique member ID
    generateMemberId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ANMC${timestamp}${random}`;
    }

    // Get all members
    async getAll(filters = {}) {
        let members = await dynamoDBService.getAllItems(this.tableName);

        // Apply filters
        if (filters.membershipCategory) {
            members = members.filter(m => m.membershipCategory === filters.membershipCategory);
        }
        if (filters.membershipType) {
            members = members.filter(m => m.membershipType === filters.membershipType);
        }
        if (filters.paymentStatus) {
            members = members.filter(m => m.paymentStatus === filters.paymentStatus);
        }
        if (filters.status) {
            members = members.filter(m => m.status === filters.status);
        }

        return members.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Get paginated members with optional filters
    async getPaginated(page = 1, limit = 20, filters = {}) {
        // Get all members (we'll optimize this if DynamoDB pagination is needed later)
        let allMembers = await this.getAll(filters);

        // Apply search filter if provided
        if (filters.q) {
            const searchQuery = filters.q.toLowerCase();
            allMembers = allMembers.filter(member => {
                // Search across multiple fields
                const searchableText = [
                    member.firstName,
                    member.lastName,
                    member.email,
                    member.mobile,
                    member.referenceNo,
                    member.memberNo,
                    member.id,
                    member.city,
                    member.state,
                    member.membershipCategory,
                    member.membershipType,
                    member.status
                ].filter(Boolean).join(' ').toLowerCase();

                return searchableText.includes(searchQuery);
            });
        }

        // Calculate pagination after search filter
        const total = allMembers.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const members = allMembers.slice(offset, offset + limit);

        return {
            data: members,
            total,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages
        };
    }

    // Get member counts without fetching full data (optimized for dashboard)
    async getCounts(filters = {}) {
        let members = await dynamoDBService.getAllItems(this.tableName);
        const now = new Date();

        // Apply filters if provided
        if (filters.membershipCategory) {
            members = members.filter(m => m.membershipCategory === filters.membershipCategory);
        }
        if (filters.membershipType) {
            members = members.filter(m => m.membershipType === filters.membershipType);
        }

        // Calculate counts
        const counts = {
            total: members.length,
            active: members.filter(m => m.status === 'active').length,
            pending: members.filter(m => m.status === 'pending_approval').length,
            inactive: members.filter(m => m.status === 'inactive').length,
            suspended: members.filter(m => m.status === 'suspended').length,
            byCategory: {
                general: members.filter(m => m.membershipCategory === 'general').length,
                life: members.filter(m => m.membershipCategory === 'life').length
            },
            byType: {
                single: members.filter(m => m.membershipType === 'single').length,
                family: members.filter(m => m.membershipType === 'family').length
            }
        };

        // Calculate expiry-related counts
        const expired = members.filter(m => this.isMembershipExpired(m));
        const expiringSoon = members.filter(m => {
            if (!m.expiryDate || m.membershipCategory === 'life') return false;
            const expiryDate = new Date(m.expiryDate);
            const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        });

        counts.expired = expired.length;
        counts.expiringSoon = expiringSoon.length;

        return counts;
    }

    // Get member by ID
    async getById(id) {
        return await dynamoDBService.getItem(this.tableName, { id });
    }

    // Get member by email
    async getByEmail(email) {
        const members = await dynamoDBService.getAllItems(this.tableName);
        return members.find(member => member.email === email);
    }

    // Get family members linked to a primary member
    async getFamilyMembers(memberId) {
        const members = await dynamoDBService.getAllItems(this.tableName);
        return members.filter(member => member.linkedToMember === memberId);
    }

    // Get primary member for a family member
    async getPrimaryMember(linkedMemberId) {
        const member = await this.getById(linkedMemberId);
        return member;
    }

    // Calculate expiry date for memberships
    calculateExpiryDate(membershipCategory, startDate = null) {
        // Life membership never expires
        if (membershipCategory === 'life') {
            return null;
        }

        // General membership expires after 1 year
        const baseDate = startDate ? new Date(startDate) : new Date();
        const expiryDate = new Date(baseDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        return expiryDate.toISOString();
    }

    // Check if membership is expired
    isMembershipExpired(member) {
        if (!member.expiryDate || member.membershipCategory === 'life') {
            return false;
        }
        return new Date() > new Date(member.expiryDate);
    }

    // Create new member
    async create(memberData) {
        const newId = this.generateMemberId();

        // Calculate expiry date based on membership category
        const expiryDate = this.calculateExpiryDate(memberData.membershipCategory);

        const newMember = {
            id: newId,
            ...memberData,
            expiryDate,
            membershipStartDate: memberData.membershipStartDate || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: memberData.status || 'active',
            referenceNo: await this.generateReferenceNo()
        };

        await dynamoDBService.putItem(this.tableName, newMember);

        return newMember;
    }

    // Update member
    async update(id, memberData) {
        const updateData = {
            ...memberData,
            updatedAt: new Date().toISOString()
        };

        await dynamoDBService.updateItem(this.tableName, { id }, updateData);
        return await this.getById(id);
    }

    // Renew membership
    async renewMembership(id, paymentData = {}) {
        const member = await this.getById(id);

        if (!member) {
            throw new Error('Member not found');
        }

        // Life memberships cannot be renewed (they don't expire)
        if (member.membershipCategory === 'life') {
            throw new Error('Life memberships do not require renewal');
        }

        // Calculate new expiry date (1 year from current expiry or from now if expired)
        const baseDate = member.expiryDate && new Date(member.expiryDate) > new Date()
            ? new Date(member.expiryDate)
            : new Date();

        const newExpiryDate = this.calculateExpiryDate(member.membershipCategory, baseDate);

        // Update member with new expiry date and renewal info
        const renewalData = {
            expiryDate: newExpiryDate,
            lastRenewalDate: new Date().toISOString(),
            renewalCount: (member.renewalCount || 0) + 1,
            status: 'active', // Reactivate if expired
            ...paymentData // Include payment info if provided
        };

        return await this.update(id, renewalData);
    }

    // Delete member
    async delete(id) {
        await dynamoDBService.deleteItem(this.tableName, { id });
        return { success: true };
    }

    // Generate reference number
    async generateReferenceNo() {
        const members = await this.getAll();
        const year = new Date().getFullYear();
        const count = members.filter(m => m.createdAt.startsWith(year.toString())).length + 1;
        return `ANMC-${year}-${String(count).padStart(4, '0')}`;
    }

    // Calculate membership fee
    calculateMembershipFee(membershipCategory, membershipType) {
        const fees = {
            'general': {
                'single': 100,
                'family': 200
            },
            'life': {
                'single': 1000,
                'family': 1500
            }
        };

        return fees[membershipCategory]?.[membershipType] || 0;
    }

    // Get statistics
    async getStats() {
        const members = await this.getAll();
        const now = new Date();

        // Get expired and expiring soon members
        const expired = members.filter(m => this.isMembershipExpired(m));
        const expiringSoon = members.filter(m => {
            if (!m.expiryDate || m.membershipCategory === 'life') return false;
            const expiryDate = new Date(m.expiryDate);
            const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30; // Expiring within 30 days
        });

        const stats = {
            total: members.length,
            active: members.filter(m => m.status === 'active').length,
            inactive: members.filter(m => m.status === 'inactive').length,
            byCategory: {
                general: members.filter(m => m.membershipCategory === 'general').length,
                life: members.filter(m => m.membershipCategory === 'life').length
            },
            byType: {
                single: members.filter(m => m.membershipType === 'single').length,
                family: members.filter(m => m.membershipType === 'family').length
            },
            byPaymentStatus: {
                paid: members.filter(m => m.paymentStatus === 'succeeded').length,
                pending: members.filter(m => m.paymentStatus === 'pending').length,
                failed: members.filter(m => m.paymentStatus === 'failed').length
            },
            byExpiryStatus: {
                expired: expired.length,
                expiringSoon: expiringSoon.length,
                active: members.filter(m => !this.isMembershipExpired(m) && (m.membershipCategory === 'life' || (m.expiryDate && new Date(m.expiryDate) > now))).length
            },
            totalRevenue: members
                .filter(m => m.paymentStatus === 'succeeded')
                .reduce((sum, m) => sum + (m.membershipFee || 0), 0)
        };

        return stats;
    }

    // Search members
    async search(query) {
        const members = await this.getAll();
        const lowercaseQuery = query.toLowerCase();

        return members.filter(member =>
            member.firstName?.toLowerCase().includes(lowercaseQuery) ||
            member.lastName?.toLowerCase().includes(lowercaseQuery) ||
            member.email?.toLowerCase().includes(lowercaseQuery) ||
            member.mobile?.includes(query) ||
            member.referenceNo?.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Validate member data
    validateMemberData(data) {
        const errors = [];

        // Required fields
        if (!data.firstName || !data.firstName.trim()) {
            errors.push('First name is required');
        }
        if (!data.lastName || !data.lastName.trim()) {
            errors.push('Last name is required');
        }
        if (!data.email || !data.email.trim()) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
        }
        if (!data.mobile || !data.mobile.trim()) {
            errors.push('Mobile number is required');
        }
        if (!data.gender) {
            errors.push('Gender is required');
        }

        // Age validation (must be 18 or above)
        if (!data.age) {
            errors.push('Age is required');
        } else if (parseInt(data.age) < 18) {
            errors.push('You must be at least 18 years old to register');
        }

        if (!data.membershipCategory) {
            errors.push('Membership category is required');
        }
        if (!data.membershipType) {
            errors.push('Membership type is required');
        }
        if (!data.residentialAddress || !data.residentialAddress.street) {
            errors.push('Residential address is required');
        }
        if (!data.acceptDeclaration) {
            errors.push('You must accept the declaration');
        }

        // Family membership validation
        if (data.membershipType === 'family' && data.familyMembers) {
            if (data.familyMembers.length === 0) {
                errors.push('Family membership requires at least one family member');
            }

            data.familyMembers.forEach((member, index) => {
                if (!member.firstName || !member.firstName.trim()) {
                    errors.push(`Family member ${index + 1}: First name is required`);
                }
                if (!member.lastName || !member.lastName.trim()) {
                    errors.push(`Family member ${index + 1}: Last name is required`);
                }
                if (!member.email || !member.email.trim()) {
                    errors.push(`Family member ${index + 1}: Email is required`);
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
                    errors.push(`Family member ${index + 1}: Invalid email format`);
                }
                if (!member.mobile || !member.mobile.trim()) {
                    errors.push(`Family member ${index + 1}: Mobile is required`);
                }
                if (!member.relationship) {
                    errors.push(`Family member ${index + 1}: Relationship is required`);
                }
                if (!member.age) {
                    errors.push(`Family member ${index + 1}: Age is required`);
                } else if (parseInt(member.age) < 18) {
                    errors.push(`Family member ${index + 1}: Must be at least 18 years old`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new MembersService();
