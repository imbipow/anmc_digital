const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
AWS.config.update({ region: 'ap-southeast-2' }); // Sydney region
const dynamodb = new AWS.DynamoDB.DocumentClient();

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

// Table names
const TABLES = {
  blogArticles: `anmc-blog-articles-${ENVIRONMENT}`,
  events: `anmc-events-${ENVIRONMENT}`,
  members: `anmc-members-${ENVIRONMENT}`,
  donations: `anmc-donations-${ENVIRONMENT}`,
  facilities: `anmc-facilities-${ENVIRONMENT}`,
  shopProducts: `anmc-shop-products-${ENVIRONMENT}`,
  organizationInfo: `anmc-organization-info-${ENVIRONMENT}`
};

// Load JSON data files
function loadJsonData(filename) {
  const filePath = path.join(__dirname, '../public/data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Seed Blog Articles
async function seedBlogArticles() {
  console.log('Seeding blog articles...');
  const blogData = loadJsonData('blog.json');

  for (const article of blogData.articles) {
    const item = {
      ...article,
      featured: article.featured ? 'true' : 'false' // Convert boolean to string for GSI
    };

    const params = {
      TableName: TABLES.blogArticles,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`✓ Added article: ${article.title}`);
    } catch (error) {
      console.error(`✗ Error adding article ${article.title}:`, error.message);
    }
  }
}

// Seed Events
async function seedEvents() {
  console.log('Seeding events...');
  const eventsData = loadJsonData('events.json');

  // Seed upcoming events
  for (const event of eventsData.upcomingEvents) {
    const item = {
      ...event,
      eventType: 'upcoming',
      date: `${event.year}-${String(event.month === 'APR' ? '04' : event.month === 'MAY' ? '05' : '03').padStart(2, '0')}-${String(event.date).padStart(2, '0')}`
    };

    const params = {
      TableName: TABLES.events,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`✓ Added upcoming event: ${event.title}`);
    } catch (error) {
      console.error(`✗ Error adding event ${event.title}:`, error.message);
    }
  }

  // Seed recent events
  for (const event of eventsData.recentEvents) {
    const item = {
      ...event,
      eventType: 'recent',
      date: event.date
    };

    const params = {
      TableName: TABLES.events,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`✓ Added recent event: ${event.title}`);
    } catch (error) {
      console.error(`✗ Error adding recent event ${event.title}:`, error.message);
    }
  }
}

// Seed Donations Data
async function seedDonations() {
  console.log('Seeding donations data...');
  const donateData = loadJsonData('donate.json');

  // Seed donation options
  for (const option of donateData.donationOptions) {
    const item = {
      donationId: `option-${option.id}`,
      timestamp: new Date().toISOString(),
      donationType: option.id,
      title: option.title,
      description: option.description,
      icon: option.icon,
      priority: option.priority,
      suggestedAmounts: option.suggestedAmounts,
      goal: option.goal,
      raised: option.raised,
      featured: option.featured || false,
      urgent: option.urgent || false
    };

    const params = {
      TableName: TABLES.donations,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`✓ Added donation option: ${option.title}`);
    } catch (error) {
      console.error(`✗ Error adding donation option ${option.title}:`, error.message);
    }
  }
}

// Seed Shop Products
async function seedShopProducts() {
  console.log('Seeding shop products...');
  const shopData = loadJsonData('shop.json');

  for (const product of shopData.products) {
    const item = {
      ...product,
      productId: product.id,
      isFeatured: product.isFeatured ? 'true' : 'false' // Convert boolean to string for GSI
    };

    delete item.id; // Remove old id field

    const params = {
      TableName: TABLES.shopProducts,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`✓ Added product: ${product.name}`);
    } catch (error) {
      console.error(`✗ Error adding product ${product.name}:`, error.message);
    }
  }
}

// Seed Facilities
async function seedFacilities() {
  console.log('Seeding facilities...');
  const memberServicesData = loadJsonData('member-services.json');

  for (const facility of memberServicesData.bookingServices.facilities) {
    const item = {
      facilityId: facility.id,
      bookingDate: 'facility-info', // Use a constant sort key for facility info records
      ...facility
    };

    const params = {
      TableName: TABLES.facilities,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`✓ Added facility: ${facility.name}`);
    } catch (error) {
      console.error(`✗ Error adding facility ${facility.name}:`, error.message);
    }
  }
}

// Seed Organization Info
async function seedOrganizationInfo() {
  console.log('Seeding organization info...');

  const contactData = loadJsonData('contact.json');
  const memberPortalData = loadJsonData('member-portal.json');
  const servicesData = loadJsonData('services.json');

  const infoRecords = [
    {
      infoType: 'contact',
      data: contactData
    },
    {
      infoType: 'membershipTiers',
      data: { membershipTiers: memberPortalData.membershipTiers }
    },
    {
      infoType: 'memberServices',
      data: { memberServices: memberPortalData.memberServices }
    },
    {
      infoType: 'projects',
      data: servicesData
    }
  ];

  for (const record of infoRecords) {
    const params = {
      TableName: TABLES.organizationInfo,
      Item: record
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`✓ Added organization info: ${record.infoType}`);
    } catch (error) {
      console.error(`✗ Error adding organization info ${record.infoType}:`, error.message);
    }
  }
}

// Sample Members (for testing)
async function seedSampleMembers() {
  console.log('Seeding sample members...');

  const sampleMembers = [
    {
      memberId: 'member-001',
      membershipTier: 'general',
      price: '50',
      duration: 'Annual',
      joinDate: '2024-01-15',
      expiryDate: '2025-01-15',
      isActive: true,
      contactInfo: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+61 400 000 001'
      }
    },
    {
      memberId: 'member-002',
      membershipTier: 'family',
      price: '120',
      duration: 'Annual',
      joinDate: '2024-02-01',
      expiryDate: '2025-02-01',
      isActive: true,
      contactInfo: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+61 400 000 002'
      }
    },
    {
      memberId: 'member-003',
      membershipTier: 'student',
      price: '25',
      duration: 'Annual',
      joinDate: '2024-03-01',
      expiryDate: '2025-03-01',
      isActive: true,
      contactInfo: {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone: '+61 400 000 003'
      }
    }
  ];

  for (const member of sampleMembers) {
    const params = {
      TableName: TABLES.members,
      Item: member
    };

    try {
      await dynamodb.put(params).promise();
      console.log(`✓ Added member: ${member.contactInfo.name}`);
    } catch (error) {
      console.error(`✗ Error adding member ${member.contactInfo.name}:`, error.message);
    }
  }
}

// Main execution function
async function seedAllData() {
  console.log('Starting data seeding process...\n');

  try {
    await seedBlogArticles();
    console.log();

    await seedEvents();
    console.log();

    await seedDonations();
    console.log();

    await seedShopProducts();
    console.log();

    await seedFacilities();
    console.log();

    await seedOrganizationInfo();
    console.log();

    await seedSampleMembers();
    console.log();

    console.log('✅ Data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during data seeding:', error);
    process.exit(1);
  }
}

// Run the seeding process
if (require.main === module) {
  seedAllData();
}

module.exports = {
  seedAllData,
  TABLES
};