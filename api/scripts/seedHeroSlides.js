/**
 * Seed Hero Slides for ANMC
 * Creates initial hero slider content
 */

const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });

const dynamodb = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'ap-southeast-2'
});

const TABLE_NAME = `anmc-hero-slides-${process.env.ENVIRONMENT || 'dev'}`;

const heroSlides = [
  {
    id: uuidv4(),
    title: 'Building Bridges, Strengthening Communities',
    subtitle: 'The Australian Nepalese Multicultural Centre is dedicated to fostering cultural diversity, community engagement, and supporting our members through various programs and initiatives.',
    welcomeText: 'Welcome to ANMC',
    buttonText: 'Learn More',
    buttonLink: '/about',
    secondaryButtonText: 'Become a Member',
    secondaryButtonLink: '/donate',
    imageUrl: '/static/media/img-3.png',
    order: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Join Our Community',
    subtitle: 'Become part of a vibrant multicultural community. Access exclusive services, events, and support programs designed to help you thrive in Australia.',
    welcomeText: 'Grow With Us',
    buttonText: 'Become a Member',
    buttonLink: '/signup',
    secondaryButtonText: 'View Services',
    secondaryButtonLink: '/member/book-services',
    imageUrl: '/static/media/img-3.png',
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Cultural Events & Programs',
    subtitle: 'Experience the rich tapestry of Nepalese culture through our diverse events, festivals, and community programs throughout the year.',
    welcomeText: 'Celebrate Culture',
    buttonText: 'View Events',
    buttonLink: '/event',
    secondaryButtonText: 'Contact Us',
    secondaryButtonLink: '/contact',
    imageUrl: '/static/media/img-3.png',
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function seedHeroSlides() {
  try {
    console.log('\n🌱 Seeding hero slides...');
    console.log(`📊 Table: ${TABLE_NAME}\n`);

    // Check if slides already exist
    const existingSlides = await dynamodb.scan({ TableName: TABLE_NAME }).promise();

    if (existingSlides.Items && existingSlides.Items.length > 0) {
      console.log(`⚠️  Found ${existingSlides.Items.length} existing slides`);
      console.log('Do you want to delete them and create new ones? (Ctrl+C to cancel)\n');

      // Wait 3 seconds before proceeding
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Delete existing slides
      console.log('🗑️  Deleting existing slides...');
      for (const slide of existingSlides.Items) {
        await dynamodb.delete({
          TableName: TABLE_NAME,
          Key: { id: slide.id }
        }).promise();
      }
      console.log('✅ Existing slides deleted\n');
    }

    // Create new slides
    for (const slide of heroSlides) {
      console.log(`  Creating slide: "${slide.title}"`);
      await dynamodb.put({
        TableName: TABLE_NAME,
        Item: slide
      }).promise();
    }

    console.log(`\n✅ Successfully seeded ${heroSlides.length} hero slides!`);
    console.log('\n📋 Created slides:');
    heroSlides.forEach((slide, index) => {
      console.log(`  ${index + 1}. ${slide.title} (Order: ${slide.order}, Active: ${slide.active})`);
    });
    console.log('\n');

  } catch (error) {
    console.error('❌ Error seeding hero slides:', error);
    throw error;
  }
}

// Run the seed function
seedHeroSlides()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
