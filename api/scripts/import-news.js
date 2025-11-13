require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = `anmc-news-${process.env.ENVIRONMENT || 'dev'}`;

// Function to convert DynamoDB JSON format to regular JSON
function convertDynamoDBItem(item) {
  const converted = {};

  for (const key in item) {
    const value = item[key];

    if (value.S !== undefined) {
      converted[key] = value.S;
    } else if (value.N !== undefined) {
      converted[key] = parseInt(value.N);
    } else if (value.BOOL !== undefined) {
      converted[key] = value.BOOL;
    } else if (value.L !== undefined) {
      converted[key] = value.L.map(v => v.S || v.N || v);
    } else if (value.M !== undefined) {
      converted[key] = convertDynamoDBItem(value.M);
    }
  }

  return converted;
}

// Function to prepare news item for our schema
function prepareNewsItem(post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt || post.content.substring(0, 200),
    category: post.category || 'news',
    authorName: post.authorName || 'ANMC',
    date: post.date || post.publishedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    publishedAt: post.publishedAt || new Date().toISOString(),
    status: post.status === 'publish' ? 'published' : post.status,
    featured: post.featured === 'true' || post.featured === true ? 'true' : 'false',
    featuredImage: post.featuredImage || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Main import function
async function importNews() {
  try {
    console.log('🔄 Starting news import...\n');

    // Read the JSON file
    const filePath = path.join(__dirname, '../data/anmc_posts_dynamo.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const posts = JSON.parse(rawData);

    console.log(`📚 Found ${posts.length} posts to import\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        // Convert from DynamoDB format
        const convertedPost = convertDynamoDBItem(post);

        // Prepare item for our schema
        const newsItem = prepareNewsItem(convertedPost);

        // Insert into DynamoDB
        await dynamodb.put({
          TableName: tableName,
          Item: newsItem
        }).promise();

        successCount++;
        console.log(`✅ Imported: ${newsItem.title} (ID: ${newsItem.id})`);

      } catch (error) {
        errorCount++;
        console.error(`❌ Error importing post ${post.id?.N || 'unknown'}:`, error.message);
      }
    }

    console.log(`\n✨ Import completed!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${posts.length}\n`);

  } catch (error) {
    console.error('💥 Fatal error during import:', error);
    process.exit(1);
  }
}

// Run the import
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║         ANMC News Posts Import Script                   ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');
console.log(`📍 Environment: ${process.env.ENVIRONMENT || 'dev'}`);
console.log(`🗄️  DynamoDB Region: ${process.env.AWS_REGION || 'ap-southeast-2'}`);
console.log(`📋 Target Table: ${tableName}\n`);

importNews()
  .then(() => {
    console.log('✅ Import script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import script failed:', error);
    process.exit(1);
  });
