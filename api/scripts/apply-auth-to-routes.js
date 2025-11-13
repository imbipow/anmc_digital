const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');

// Routes that need authentication on POST/PUT/DELETE only (public GET)
const contentRoutes = ['news.js', 'projects.js'];

// Routes that need authentication on ALL operations
const protectedRoutes = [
  'donations.js',
  'members.js',
  'bookings.js',
  'documents.js',
  'subscribers.js',
  'messages.js'
];

function addAuthToRoute(filePath, allOperations = false) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already has auth import
  if (content.includes("require('../middleware/auth')")) {
    console.log(`✓ ${path.basename(filePath)} already has auth imported`);
    return;
  }

  // Add auth import after service import
  content = content.replace(
    /(const \w+Service = require\('\.\.\/services\/\w+Service'\);)/,
    "$1\nconst { verifyToken, requireAdmin } = require('../middleware/auth');"
  );

  if (allOperations) {
    // Protect ALL operations (GET, POST, PUT, DELETE)
    content = content.replace(
      /router\.(get|post|put|delete)\('([^']+)',\s*async/g,
      "router.$1('$2', verifyToken, requireAdmin, async"
    );
  } else {
    // Protect only POST, PUT, DELETE operations
    content = content.replace(
      /router\.(post|put|delete)\('([^']+)',\s*async/g,
      "router.$1('$2', verifyToken, requireAdmin, async"
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Applied auth to ${path.basename(filePath)}`);
}

console.log('🔐 Applying authentication to routes...\n');

// Apply auth to content routes (POST/PUT/DELETE only)
console.log('Content routes (protecting write operations):');
contentRoutes.forEach(route => {
  const filePath = path.join(routesDir, route);
  if (fs.existsSync(filePath)) {
    addAuthToRoute(filePath, false);
  } else {
    console.log(`⚠ ${route} not found`);
  }
});

console.log('\nProtected routes (protecting all operations):');
// Apply auth to fully protected routes (ALL operations)
protectedRoutes.forEach(route => {
  const filePath = path.join(routesDir, route);
  if (fs.existsSync(filePath)) {
    addAuthToRoute(filePath, true);
  } else {
    console.log(`⚠ ${route} not found`);
  }
});

console.log('\n✅ Authentication applied successfully!');
