// Quick test script to add some sample data
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: 'ap-southeast-2'
});

const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'ContentTable-dev';

async function addSampleData() {
  const sampleItems = [
    {
      id: 'hero',
      type: 'homepage',
      data: {
        title: 'Welcome to ANMC',
        subtitle: 'Australian National Multicultural Center',
        description: 'Building bridges between communities'
      },
      created_at: new Date().toISOString()
    },
    {
      id: 'counter_1',
      type: 'counters',
      title: 'Members',
      count: 1500,
      created_at: new Date().toISOString()
    },
    {
      id: 'news_1',
      type: 'news',
      title: 'Community Event Success',
      content: 'Our recent community event was a great success!',
      author: 'ANMC Team',
      date: new Date().toISOString(),
      featured: true,
      created_at: new Date().toISOString()
    }
  ];

  try {
    for (const item of sampleItems) {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      });
      
      await dynamodb.send(command);
      console.log(`✓ Added: ${item.type}/${item.id}`);
    }
    console.log('✅ Sample data added successfully!');
  } catch (error) {
    console.error('❌ Failed to add sample data:', error);
  }
}

addSampleData();