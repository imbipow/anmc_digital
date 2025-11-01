const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
const region = process.env.AWS_REGION || 'ap-southeast-2';
AWS.config.update({ region });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

// Table names
const TABLES = {
  news: `anmc-news-${ENVIRONMENT}`,
  events: `anmc-events-${ENVIRONMENT}`,
  projects: `anmc-projects-${ENVIRONMENT}`,
  facilities: `anmc-facilities-${ENVIRONMENT}`,
  homepage: `anmc-homepage-${ENVIRONMENT}`,
  counters: `anmc-counters-${ENVIRONMENT}`,
  aboutUs: `anmc-about-us-${ENVIRONMENT}`,
  contact: `anmc-contact-${ENVIRONMENT}`,
  masterPlan: `anmc-master-plan-${ENVIRONMENT}`,
  projectAchievements: `anmc-project-achievements-${ENVIRONMENT}`
};

// Load db.json data
function loadDbJson() {
  const filePath = path.join(__dirname, '../server/db.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Helper function to batch write items
async function batchWriteItems(tableName, items) {
  const BATCH_SIZE = 25; // DynamoDB limit

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const params = {
      RequestItems: {
        [tableName]: batch.map(item => ({
          PutRequest: { Item: item }
        }))
      }
    };

    try {
      await dynamodb.batchWrite(params).promise();
      console.log(`  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1} written successfully (${batch.length} items)`);
    } catch (error) {
      console.error(`  ✗ Error writing batch:`, error.message);
      throw error;
    }
  }
}

// Seed News/Blog Articles
async function seedNews(dbData) {
  console.log('\n📰 Seeding news articles...');

  const items = dbData.news.map(article => ({
    ...article,
    featured: article.featured ? 'true' : 'false', // Convert to string for GSI
    tags: article.tags || [] // Ensure tags is always an array
  }));

  await batchWriteItems(TABLES.news, items);
  console.log(`✅ Successfully seeded ${items.length} news articles`);
}

// Seed Events
async function seedEvents(dbData) {
  console.log('\n📅 Seeding events...');

  const items = dbData.events.map(event => ({
    ...event,
    featured: event.featured ? 'true' : 'false', // Convert to string for GSI
    tags: event.tags || []
  }));

  await batchWriteItems(TABLES.events, items);
  console.log(`✅ Successfully seeded ${items.length} events`);
}

// Seed Projects
async function seedProjects(dbData) {
  console.log('\n🏗️  Seeding projects...');

  const items = dbData.projects.map(project => ({
    ...project,
    featured: project.featured ? 'true' : 'false', // Convert to string for GSI
    tags: project.tags || []
  }));

  await batchWriteItems(TABLES.projects, items);
  console.log(`✅ Successfully seeded ${items.length} projects`);
}

// Seed Facilities
async function seedFacilities(dbData) {
  console.log('\n🏢 Seeding facilities...');

  const items = dbData.facilities;

  await batchWriteItems(TABLES.facilities, items);
  console.log(`✅ Successfully seeded ${items.length} facilities`);
}

// Seed Homepage Content
async function seedHomepage(dbData) {
  console.log('\n🏠 Seeding homepage content...');

  const items = dbData.homepage;

  for (const item of items) {
    const params = {
      TableName: TABLES.homepage,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`  ✓ Added homepage component: ${item.component}`);
    } catch (error) {
      console.error(`  ✗ Error adding homepage component ${item.component}:`, error.message);
    }
  }

  console.log(`✅ Successfully seeded ${items.length} homepage components`);
}

// Seed Counters
async function seedCounters(dbData) {
  console.log('\n🔢 Seeding counters...');

  const items = dbData.counters;

  await batchWriteItems(TABLES.counters, items);
  console.log(`✅ Successfully seeded ${items.length} counters`);
}

// Seed About Us
async function seedAboutUs(dbData) {
  console.log('\n📖 Seeding about us content...');

  const items = dbData.about_us;

  for (const item of items) {
    const params = {
      TableName: TABLES.aboutUs,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`  ✓ Added about us record: ${item.id}`);
    } catch (error) {
      console.error(`  ✗ Error adding about us record ${item.id}:`, error.message);
    }
  }

  console.log(`✅ Successfully seeded ${items.length} about us records`);
}

// Seed Contact Information
async function seedContact(dbData) {
  console.log('\n📞 Seeding contact information...');

  const items = dbData.contact;

  for (const item of items) {
    const params = {
      TableName: TABLES.contact,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`  ✓ Added contact record: ${item.id}`);
    } catch (error) {
      console.error(`  ✗ Error adding contact record ${item.id}:`, error.message);
    }
  }

  console.log(`✅ Successfully seeded ${items.length} contact records`);
}

// Seed Master Plan
async function seedMasterPlan(dbData) {
  console.log('\n🎯 Seeding master plan...');

  const masterPlan = {
    id: 'master-plan-2025-2030',
    ...dbData.master_plan
  };

  const params = {
    TableName: TABLES.masterPlan,
    Item: masterPlan
  };

  try {
    await dynamodb.put(params).promise();
    console.log(`  ✓ Added master plan: ${masterPlan.title}`);
    console.log(`✅ Successfully seeded master plan`);
  } catch (error) {
    console.error(`  ✗ Error adding master plan:`, error.message);
  }
}

// Seed Project Achievements
async function seedProjectAchievements(dbData) {
  console.log('\n🏆 Seeding project achievements...');

  const items = dbData.project_achievements;

  await batchWriteItems(TABLES.projectAchievements, items);
  console.log(`✅ Successfully seeded ${items.length} project achievements`);
}

// Main execution function
async function seedAllData() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   ANMC Digital - DynamoDB Data Seeding Process          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n🌍 Region: ${region} (Sydney)`);
  console.log(`🏷️  Environment: ${ENVIRONMENT}\n`);

  try {
    const dbData = loadDbJson();
    console.log('✓ Successfully loaded db.json');

    await seedNews(dbData);
    await seedEvents(dbData);
    await seedProjects(dbData);
    await seedFacilities(dbData);
    await seedHomepage(dbData);
    await seedCounters(dbData);
    await seedAboutUs(dbData);
    await seedContact(dbData);
    await seedMasterPlan(dbData);
    await seedProjectAchievements(dbData);

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Data seeding completed successfully!               ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   ❌ Error during data seeding                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Clear all tables function
async function clearAllTables() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   🗑️  Clearing all DynamoDB tables...                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  for (const [name, tableName] of Object.entries(TABLES)) {
    console.log(`Clearing ${name} table (${tableName})...`);

    try {
      // Scan the table
      const scanParams = {
        TableName: tableName
      };
      const scanResult = await dynamodb.scan(scanParams).promise();

      if (scanResult.Items.length === 0) {
        console.log(`  ✓ Table ${name} is already empty`);
        continue;
      }

      // Get table key schema to determine which attributes to use for deletion
      const describeParams = {
        TableName: tableName
      };
      const tableDescription = await new AWS.DynamoDB().describeTable(describeParams).promise();
      const keySchema = tableDescription.Table.KeySchema;

      // Delete all items
      for (const item of scanResult.Items) {
        const key = {};
        keySchema.forEach(k => {
          key[k.AttributeName] = item[k.AttributeName];
        });

        const deleteParams = {
          TableName: tableName,
          Key: key
        };

        await dynamodb.delete(deleteParams).promise();
      }

      console.log(`  ✓ Cleared ${scanResult.Items.length} items from ${name}`);
    } catch (error) {
      console.error(`  ✗ Error clearing ${name}:`, error.message);
    }
  }

  console.log('\n✅ All tables cleared successfully!\n');
}

// Run the seeding process
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--clear')) {
    clearAllTables().then(() => {
      if (args.includes('--seed')) {
        seedAllData();
      }
    });
  } else {
    seedAllData();
  }
}

module.exports = {
  seedAllData,
  clearAllTables,
  TABLES
};
