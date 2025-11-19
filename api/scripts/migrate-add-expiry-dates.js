/**
 * Migration Script: Add Expiry Dates to Existing Members
 *
 * This script updates all existing member records in DynamoDB to include:
 * - expiryDate (for general memberships)
 * - membershipStartDate
 * - renewalCount (initialized to 0)
 *
 * Run this script once to migrate existing data:
 * node api/scripts/migrate-add-expiry-dates.js
 */

const dynamoDBService = require('../services/dynamodb');
const config = require('../config');

const MEMBERS_TABLE = config.tables.members;

// Calculate expiry date (same logic as in membersService)
function calculateExpiryDate(membershipCategory, startDate = null) {
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

async function migrateMembers() {
    try {
        console.log('🚀 Starting migration: Add expiry dates to existing members...');
        console.log(`📋 Table: ${MEMBERS_TABLE}\n`);

        // Get all members
        const members = await dynamoDBService.getAllItems(MEMBERS_TABLE);
        console.log(`📊 Found ${members.length} members to migrate\n`);

        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const member of members) {
            try {
                // Check if member already has expiry date
                if (member.expiryDate !== undefined && member.membershipStartDate !== undefined) {
                    console.log(`⏭️  Skipping ${member.email} - already has expiry data`);
                    skippedCount++;
                    continue;
                }

                // Prepare update data
                const updateData = {
                    updatedAt: new Date().toISOString()
                };

                // Set membership start date (use createdAt or approvedAt if available)
                if (!member.membershipStartDate) {
                    updateData.membershipStartDate = member.approvedAt || member.createdAt || new Date().toISOString();
                }

                // Calculate and set expiry date based on membership category
                if (member.expiryDate === undefined) {
                    const startDate = updateData.membershipStartDate || member.createdAt;
                    updateData.expiryDate = calculateExpiryDate(member.membershipCategory, startDate);
                }

                // Initialize renewal count if not present
                if (member.renewalCount === undefined) {
                    updateData.renewalCount = 0;
                }

                // Update the member
                await dynamoDBService.updateItem(MEMBERS_TABLE, { id: member.id }, updateData);

                const expiryInfo = updateData.expiryDate
                    ? `expires ${new Date(updateData.expiryDate).toLocaleDateString()}`
                    : 'never expires (life membership)';

                console.log(`✅ Updated ${member.email} (${member.referenceNo}) - ${expiryInfo}`);
                updatedCount++;

            } catch (error) {
                console.error(`❌ Error updating ${member.email}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📈 Migration Summary:');
        console.log(`   ✅ Updated: ${updatedCount}`);
        console.log(`   ⏭️  Skipped: ${skippedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📊 Total: ${members.length}`);
        console.log('='.repeat(60));

        if (errorCount === 0) {
            console.log('\n🎉 Migration completed successfully!');
        } else {
            console.log('\n⚠️  Migration completed with errors. Please review the error messages above.');
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateMembers()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });
