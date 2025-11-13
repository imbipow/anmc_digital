const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS
AWS.config.update({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment
const environment = process.env.ENVIRONMENT || 'dev';

// Table names
const tables = {
    members: `anmc-members-${environment}`,
    donations: `anmc-donations-${environment}`
};

// Load data from JSON files
const loadJsonData = (filename) => {
    const filePath = path.join(__dirname, '..', 'api', 'data', filename);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return [];
};

// Batch write items to DynamoDB
async function batchWriteItems(tableName, items) {
    if (!items || items.length === 0) {
        console.log(`No items to seed for ${tableName}`);
        return;
    }

    const BATCH_SIZE = 25; // DynamoDB limit
    const batches = [];

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        batches.push(items.slice(i, i + BATCH_SIZE));
    }

    console.log(`Seeding ${items.length} items to ${tableName} in ${batches.length} batch(es)...`);

    for (const [index, batch] of batches.entries()) {
        const params = {
            RequestItems: {
                [tableName]: batch.map(item => ({
                    PutRequest: { Item: item }
                }))
            }
        };

        try {
            await dynamodb.batchWrite(params).promise();
            console.log(`✓ Batch ${index + 1}/${batches.length} completed`);
        } catch (error) {
            console.error(`✗ Error writing batch ${index + 1}:`, error.message);
            throw error;
        }
    }

    console.log(`✓ Successfully seeded ${items.length} items to ${tableName}\n`);
}

// Main seeding function
async function seedData() {
    console.log('==========================================');
    console.log('  ANMC Missing Tables Data Seeding');
    console.log('==========================================\n');
    console.log(`Environment: ${environment}`);
    console.log(`Region: ${AWS.config.region}\n`);

    try {
        // Seed Members
        console.log('--- Seeding Members ---');
        const members = loadJsonData('members.json');
        await batchWriteItems(tables.members, members);

        // Seed Donations
        console.log('--- Seeding Donations ---');
        const donations = loadJsonData('donations.json');
        await batchWriteItems(tables.donations, donations);

        console.log('==========================================');
        console.log('  ✓ All data seeded successfully!');
        console.log('==========================================\n');
        console.log('Summary:');
        console.log(`- Members: ${members.length} items`);
        console.log(`- Donations: ${donations.length} items`);
        console.log(`- Total: ${members.length + donations.length} items\n`);

    } catch (error) {
        console.error('\n==========================================');
        console.error('  ✗ Seeding failed!');
        console.error('==========================================');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedData();
