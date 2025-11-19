/**
 * Check Member Expiry Status
 *
 * This script displays the expiry status of all members in the system.
 *
 * Run: node api/scripts/check-member-expiry.js
 */

const dynamoDBService = require('../services/dynamodb');
const membersService = require('../services/membersService');
const config = require('../config');

const MEMBERS_TABLE = config.tables.members;

async function checkMemberExpiry() {
    try {
        console.log('📋 Member Expiry Status Report');
        console.log('='.repeat(80));
        console.log('');

        // Get all members
        const members = await dynamoDBService.getAllItems(MEMBERS_TABLE);
        const now = new Date();

        // Categorize members
        const expired = [];
        const expiringSoon = [];
        const active = [];
        const lifeMemberships = [];

        members.forEach(member => {
            if (member.membershipCategory === 'life') {
                lifeMemberships.push(member);
            } else if (!member.expiryDate) {
                // Should not happen after migration
                console.log(`⚠️  Warning: ${member.email} has no expiry date!`);
            } else {
                const expiryDate = new Date(member.expiryDate);
                const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

                if (daysUntilExpiry < 0) {
                    expired.push({ ...member, daysUntilExpiry });
                } else if (daysUntilExpiry <= 30) {
                    expiringSoon.push({ ...member, daysUntilExpiry });
                } else {
                    active.push({ ...member, daysUntilExpiry });
                }
            }
        });

        // Display summary
        console.log('📊 Summary:');
        console.log(`   Total Members: ${members.length}`);
        console.log(`   🟢 Life Memberships (never expire): ${lifeMemberships.length}`);
        console.log(`   🟢 Active (>30 days): ${active.length}`);
        console.log(`   🟠 Expiring Soon (≤30 days): ${expiringSoon.length}`);
        console.log(`   🔴 Expired: ${expired.length}`);
        console.log('');

        // Display expired members
        if (expired.length > 0) {
            console.log('🔴 EXPIRED MEMBERS:');
            console.log('-'.repeat(80));
            expired.forEach(member => {
                const expiryDate = new Date(member.expiryDate);
                console.log(`   ${member.referenceNo} | ${member.firstName} ${member.lastName}`);
                console.log(`   📧 ${member.email}`);
                console.log(`   📅 Expired: ${expiryDate.toLocaleDateString()} (${Math.abs(member.daysUntilExpiry)} days ago)`);
                console.log(`   📝 Category: ${member.membershipCategory} | Type: ${member.membershipType}`);
                console.log(`   🔄 Renewals: ${member.renewalCount || 0}`);
                console.log('');
            });
        }

        // Display expiring soon
        if (expiringSoon.length > 0) {
            console.log('🟠 EXPIRING SOON (Within 30 Days):');
            console.log('-'.repeat(80));
            expiringSoon.forEach(member => {
                const expiryDate = new Date(member.expiryDate);
                console.log(`   ${member.referenceNo} | ${member.firstName} ${member.lastName}`);
                console.log(`   📧 ${member.email}`);
                console.log(`   📅 Expires: ${expiryDate.toLocaleDateString()} (${member.daysUntilExpiry} days)`);
                console.log(`   📝 Category: ${member.membershipCategory} | Type: ${member.membershipType}`);
                console.log(`   🔄 Renewals: ${member.renewalCount || 0}`);
                console.log('');
            });
        }

        // Display active members
        if (active.length > 0) {
            console.log('🟢 ACTIVE MEMBERS (>30 Days):');
            console.log('-'.repeat(80));
            active.forEach(member => {
                const expiryDate = new Date(member.expiryDate);
                console.log(`   ${member.referenceNo} | ${member.firstName} ${member.lastName}`);
                console.log(`   📧 ${member.email}`);
                console.log(`   📅 Expires: ${expiryDate.toLocaleDateString()} (${member.daysUntilExpiry} days)`);
                console.log(`   📝 Category: ${member.membershipCategory} | Type: ${member.membershipType}`);
                console.log(`   🔄 Renewals: ${member.renewalCount || 0}`);
                console.log('');
            });
        }

        // Display life memberships
        if (lifeMemberships.length > 0) {
            console.log('🟢 LIFE MEMBERSHIPS (Never Expire):');
            console.log('-'.repeat(80));
            lifeMemberships.forEach(member => {
                console.log(`   ${member.referenceNo} | ${member.firstName} ${member.lastName}`);
                console.log(`   📧 ${member.email}`);
                console.log(`   📅 Never expires`);
                console.log(`   📝 Category: ${member.membershipCategory} | Type: ${member.membershipType}`);
                console.log('');
            });
        }

        console.log('='.repeat(80));
        console.log('✨ Report completed!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run check
checkMemberExpiry()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
