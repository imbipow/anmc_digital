const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Lazy-load JWKS client to allow secrets to be loaded first
let client = null;

function getJwksClient() {
  if (!client) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const region = process.env.AWS_REGION || 'ap-southeast-2';

    if (!userPoolId) {
      throw new Error('COGNITO_USER_POOL_ID not found in environment variables. Ensure secrets are loaded.');
    }

    client = jwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true
    });

    console.log('✅ JWKS client initialized for Cognito authentication');
  }
  return client;
}

// Get signing key from Cognito
function getKey(header, callback) {
  try {
    const jwksClient = getJwksClient();
    jwksClient.getSigningKey(header.kid, function(err, key) {
      if (err) {
        callback(err);
      } else {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      }
    });
  } catch (error) {
    callback(error);
  }
}

/**
 * Middleware to verify Cognito JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided. Please include Authorization header with Bearer token.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`
    }, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err.message);
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }

      // Attach user info to request
      req.user = {
        sub: decoded.sub,
        email: decoded.email,
        groups: decoded['cognito:groups'] || [],
        username: decoded['cognito:username']
      };

      next();
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error during authentication'
    });
  }
};

/**
 * Middleware to check if user is an admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Check if user is in admin groups
  // Support both naming conventions: Admin/ANMCMembers and AnmcAdmins/AnmcManagers
  const isAdmin = req.user.groups.includes('Admin') ||
                  req.user.groups.includes('ANMCMembers') ||
                  req.user.groups.includes('AnmcAdmins') ||
                  req.user.groups.includes('AnmcManagers');

  if (!isAdmin) {
    console.log('Access denied. User groups:', req.user.groups);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required. User must be in Admin, ANMCMembers, AnmcAdmins, or AnmcManagers group.'
    });
  }

  next();
};

/**
 * Middleware to check if user is an admin or manager
 * Managers have access to bookings, messages, and documents
 */
const requireManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Check if user is in admin or manager groups
  const hasAccess = req.user.groups.includes('Admin') ||
                    req.user.groups.includes('ANMCMembers') ||
                    req.user.groups.includes('AnmcAdmins') ||
                    req.user.groups.includes('AnmcManagers');

  if (!hasAccess) {
    console.log('Access denied. User groups:', req.user.groups);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Manager or Admin access required.'
    });
  }

  next();
};

/**
 * Optional authentication - doesn't fail if token is missing
 * Used for endpoints that have different behavior for authenticated users
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without auth
    return next();
  }

  const token = authHeader.substring(7);

  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`
  }, (err, decoded) => {
    if (!err) {
      req.user = {
        sub: decoded.sub,
        email: decoded.email,
        groups: decoded['cognito:groups'] || [],
        username: decoded['cognito:username']
      };
    }
    next();
  });
};

/**
 * Middleware to check if user is authenticated (any member)
 * Used for member portal endpoints where any logged-in member can access
 */
const requireMember = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please log in to access this resource.'
    });
  }

  // User is authenticated - allow access
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireManager,
  requireMember,
  optionalAuth
};
