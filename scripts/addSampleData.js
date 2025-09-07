#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Configure DynamoDB client
const client = new DynamoDBClient({
  region: 'ap-southeast-2', // Adjust to your region
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'ContentTable-dev'; // Adjust to your table name

// Sample data
const sampleData = [
  {
    id: 'hero',
    type: 'homepage',
    data: {
      title: 'Welcome to ANMC Digital',
      subtitle: 'Empowering Communities Through Technology',
      description: 'Building bridges between communities and digital innovation for a better tomorrow.',
      buttonText: 'Learn More',
      buttonLink: '/about',
      backgroundImage: '/images/hero-bg.jpg'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'counter_1',
    type: 'counters',
    data: {
      title: 'Projects Completed',
      count: 150,
      icon: 'project'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'counter_2',
    type: 'counters',
    data: {
      title: 'Happy Clients',
      count: 200,
      icon: 'users'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'counter_3',
    type: 'counters',
    data: {
      title: 'Years Experience',
      count: 10,
      icon: 'calendar'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'blog_section_content',
    type: 'blog_section',
    data: {
      title: 'Latest News & Updates',
      subtitle: 'Stay informed with our latest insights and community updates',
      description: 'Discover the latest developments in our community initiatives and digital transformation projects.'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'news_1',
    type: 'news',
    featured: true,
    data: {
      title: 'Community Digital Literacy Program Launch',
      excerpt: 'We are excited to announce the launch of our new digital literacy program designed to empower community members with essential digital skills.',
      content: 'Our comprehensive digital literacy program covers everything from basic computer skills to advanced digital tools usage...',
      image: '/images/news/digital-literacy.jpg',
      author: 'ANMC Team',
      publishDate: '2024-03-15',
      tags: ['education', 'community', 'digital-literacy']
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'event_1',
    type: 'events',
    featured: true,
    data: {
      title: 'Annual Community Technology Summit',
      description: 'Join us for our annual technology summit where we will showcase the latest innovations and their impact on our community.',
      date: '2024-04-20',
      time: '10:00 AM - 4:00 PM',
      location: 'ANMC Community Center',
      image: '/images/events/tech-summit.jpg',
      registrationLink: '/register/tech-summit-2024'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'project_1',
    type: 'projects',
    featured: true,
    data: {
      title: 'Smart Community Platform',
      description: 'A comprehensive digital platform connecting community members, resources, and services for better collaboration.',
      image: '/images/projects/smart-platform.jpg',
      status: 'In Progress',
      completionDate: '2024-06-30',
      technologies: ['React', 'Node.js', 'AWS', 'DynamoDB']
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function addSampleData() {
  console.log('Adding sample data to DynamoDB...');
  
  try {
    for (const item of sampleData) {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      });
      
      await docClient.send(command);
      console.log(`✓ Added item: ${item.id} (${item.type})`);
    }
    
    console.log('✅ Sample data added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
}

addSampleData();