require('dotenv').config();
const dynamoDBService = require('../services/dynamodb');
const servicesData = require('../data/services.json');
const config = require('../config');

const tableName = config.tables.services;

async function seedServices() {
    console.log(`🌱 Seeding services table: ${tableName}`);
    console.log(`📊 Found ${servicesData.length} services to seed`);

    try {
        for (const service of servicesData) {
            console.log(`  → Creating service: ${service.anusthanName}`);
            await dynamoDBService.putItem(tableName, {
                ...service,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        console.log('✅ Services seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding services:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedServices()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = seedServices;
