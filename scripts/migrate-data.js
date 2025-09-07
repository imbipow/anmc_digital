const AWS = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

// Configure AWS
const client = new AWS.DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'ContentTable-dev';

// Read existing data from server/db.json
const dbPath = path.join(__dirname, '..', 'server', 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function migrateData() {
  console.log('Starting data migration to DynamoDB...');
  
  try {
    // Migrate homepage data
    if (data.homepage) {
      for (const item of data.homepage) {
        await putItem({
          id: item.id,
          type: 'homepage',
          data: item.data,
          created_at: new Date().toISOString()
        });
      }
      console.log(`Migrated ${data.homepage.length} homepage items`);
    }

    // Migrate counters
    if (data.counters) {
      for (let i = 0; i < data.counters.length; i++) {
        const item = data.counters[i];
        await putItem({
          id: `counter_${i}`,
          type: 'counters',
          title: item.title,
          count: item.count,
          created_at: new Date().toISOString()
        });
      }
      console.log(`Migrated ${data.counters.length} counter items`);
    }

    // Migrate blog posts
    if (data.blog_posts) {
      for (const item of data.blog_posts) {
        await putItem({
          id: `blog_${item.id}`,
          type: 'blog_posts',
          title: item.title,
          content: item.content,
          author: item.author,
          date: item.date,
          image: item.image,
          featured: item.featured || false,
          created_at: item.date || new Date().toISOString()
        });
      }
      console.log(`Migrated ${data.blog_posts.length} blog posts`);
    }

    // Migrate news
    if (data.news) {
      for (const item of data.news) {
        await putItem({
          id: `news_${item.id}`,
          type: 'news',
          title: item.title,
          content: item.content,
          date: item.date,
          image: item.image,
          featured: item.featured || false,
          created_at: item.date || new Date().toISOString()
        });
      }
      console.log(`Migrated ${data.news.length} news items`);
    }

    // Migrate events
    if (data.events) {
      for (const item of data.events) {
        await putItem({
          id: `event_${item.id}`,
          type: 'events',
          title: item.title,
          description: item.description,
          date: item.date,
          location: item.location,
          image: item.image,
          featured: item.featured || false,
          created_at: item.date || new Date().toISOString()
        });
      }
      console.log(`Migrated ${data.events.length} events`);
    }

    // Migrate projects
    if (data.projects) {
      for (const item of data.projects) {
        await putItem({
          id: `project_${item.id}`,
          type: 'projects',
          title: item.title,
          description: item.description,
          image: item.image,
          featured: item.featured || false,
          created_at: new Date().toISOString()
        });
      }
      console.log(`Migrated ${data.projects.length} projects`);
    }

    // Migrate other content types
    const otherTypes = ['blog_section', 'about_us', 'facilities', 'contact'];
    for (const type of otherTypes) {
      if (data[type]) {
        for (const item of data[type]) {
          await putItem({
            id: item.id || `${type}_main`,
            type: type,
            data: item.data || item,
            created_at: new Date().toISOString()
          });
        }
        console.log(`Migrated ${data[type].length} ${type} items`);
      }
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function putItem(item) {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  });
  
  try {
    await dynamodb.send(command);
    console.log(`✓ Migrated: ${item.type}/${item.id}`);
  } catch (error) {
    console.error(`✗ Failed to migrate ${item.type}/${item.id}:`, error.message);
    throw error;
  }
}

// Run migration
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };