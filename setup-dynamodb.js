#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up DynamoDB integration...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Creating one from .env.example...');
  
  const envExamplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file. Please update it with your AWS credentials.\n');
  } else {
    console.log('❌ No .env.example file found. Please create a .env file manually.\n');
    process.exit(1);
  }
}

// Check if server/db.json exists for migration
const dbJsonPath = path.join(__dirname, 'server', 'db.json');
if (!fs.existsSync(dbJsonPath)) {
  console.log('❌ No server/db.json found. Cannot migrate existing data.\n');
} else {
  console.log('✅ Found existing data in server/db.json\n');
  
  // Install AWS SDK if not present
  try {
    require('@aws-sdk/client-dynamodb');
    console.log('✅ AWS SDK already installed\n');
  } catch (error) {
    console.log('📦 Installing AWS SDK for migration...');
    try {
      execSync('npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb', { stdio: 'inherit' });
      console.log('✅ AWS SDK installed\n');
    } catch (installError) {
      console.error('❌ Failed to install AWS SDK:', installError.message);
      process.exit(1);
    }
  }
  
  // Run migration
  console.log('🔄 Running data migration to DynamoDB...');
  console.log('Make sure your .env file has the correct AWS credentials and region.\n');
  
  try {
    execSync('node scripts/migrate-data.js', { stdio: 'inherit' });
    console.log('\n✅ Data migration completed successfully!');
  } catch (migrationError) {
    console.error('\n❌ Migration failed. Please check your AWS credentials and DynamoDB table.');
    console.error('Error:', migrationError.message);
  }
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Verify your .env file has correct AWS credentials');
console.log('2. Make sure your DynamoDB table "ContentTable-dev" exists');
console.log('3. Run: npm start');
console.log('4. Access admin at: /admin');

console.log('\n📚 Your application now uses:');
console.log('- AWS Amplify for API management');
console.log('- DynamoDB for data storage');
console.log('- React Admin for content management');
console.log('\nCheck AWS_SETUP.md for detailed deployment instructions.');