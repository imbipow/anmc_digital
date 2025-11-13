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

        return members.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

    // Create new member
    async create(memberData) {
        const newId = this.generateMemberId();
        const newMember = {
            id: newId,
            ...memberData,
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
                if (!member.firstName || !member.lastName) {
                    errors.push(`Family member ${index + 1}: Name is required`);
                }
                if (!member.relationship) {
                    errors.push(`Family member ${index + 1}: Relationship is required`);
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
