# Windows Setup Guide

## Cross-Platform Compatibility

This project uses `cross-env` to ensure npm scripts work on Windows, macOS, and Linux.

## What Was Fixed

The original scripts used Unix-style environment variables:
```bash
ENVIRONMENT=dev node seed-data-updated.js  # ❌ Doesn't work on Windows
```

Now they use `cross-env` for cross-platform compatibility:
```bash
cross-env ENVIRONMENT=dev node seed-data-updated.js  # ✅ Works everywhere
```

## Installation

The `cross-env` package is automatically installed when you run:
```bash
cd aws-infrastructure
npm install
```

## Usage

All npm scripts now work on Windows:

```bash
# Seeding scripts
npm run seed:dev           # Seed development environment
npm run seed:staging       # Seed staging environment
npm run seed:prod          # Seed production environment

# Clear and reset scripts
npm run seed:clear         # Clear all tables
npm run seed:clear:dev     # Clear dev tables
npm run seed:reset         # Clear and re-seed
npm run seed:reset:dev     # Clear and re-seed dev

# Validation
npm run validate           # Validate CloudFormation template
```

## Windows-Specific Notes

### AWS CLI on Windows

Make sure AWS CLI is installed and accessible:
```powershell
# Check installation
aws --version

# Configure credentials
aws configure
```

### PowerShell Alternative

If you prefer PowerShell, you can also run scripts directly:

```powershell
# Set environment variable in PowerShell
$env:ENVIRONMENT = "dev"
$env:AWS_REGION = "ap-southeast-2"
node seed-data-updated.js
```

### CMD Alternative

Or in Command Prompt:

```cmd
# Set environment variable in CMD
set ENVIRONMENT=dev
set AWS_REGION=ap-southeast-2
node seed-data-updated.js
```

## Testing

After running `npm install`, test that everything works:

```bash
# Test seeding (will seed to DynamoDB if tables exist)
npm run seed:dev
```

Expected output:
```
╔══════════════════════════════════════════════════════════╗
║   ANMC Digital - DynamoDB Data Seeding Process          ║
╚══════════════════════════════════════════════════════════╝

🌍 Region: ap-southeast-2 (Sydney)
🏷️  Environment: dev

✓ Successfully loaded db.json

📰 Seeding news articles...
  ✓ Batch 1 written successfully (6 items)
✅ Successfully seeded 6 news articles
...
```

## Troubleshooting

### "cross-env is not recognized"

If you get this error, run:
```bash
npm install
```

### "aws is not recognized"

Install AWS CLI for Windows from:
https://aws.amazon.com/cli/

### Permission Issues

Run PowerShell or CMD as Administrator if you encounter permission errors.

## Success!

✅ Your Windows environment is now fully configured to work with the ANMC DynamoDB infrastructure!
