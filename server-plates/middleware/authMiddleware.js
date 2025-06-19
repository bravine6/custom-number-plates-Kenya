const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models');

// Import mock database for fallback
const mockDb = require('../data/mockData');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Skip authentication in development mode if specified in the environment
  if (process.env.NODE_ENV !== 'production' && process.env.SKIP_AUTH === 'true') {
    console.log('Authentication bypassed in development mode');
    // Create a mock user with proper UUID
    req.user = {
      id: require('crypto').randomUUID(),
      name: 'Development User',
      email: 'dev@example.com',
      isAdmin: true
    };
    next();
    return;
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_for_dev');

      // Always use mock database when there's a database error
      console.log('Using mock database for authentication');
      
      // Get the supabase instance from the request if available
      const supabaseClient = req.supabase;
      
      if ((process.env.USE_MOCK_DB === 'true' && req.mockDb) || !supabaseClient) {
        // Get user from mock database
        const user = await mockDb.users.findById(decoded.id);
        
        if (!user) {
          res.status(401);
          throw new Error('Not authorized, user not found');
        }
        
        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        
        // Set user in request
        req.user = userWithoutPassword;
      } else {
        // Get user from Supabase
        const { data: user, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', decoded.id)
          .single();
        
        if (error) {
          console.error('Error fetching user from Supabase:', error);
          throw new Error('Not authorized, user not found');
        }
        
        if (!user) {
          res.status(401);
          throw new Error('Not authorized, user not found');
        }
        
        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        
        // Set user in request
        req.user = userWithoutPassword;
      }
      
      next();
      return;
    } catch (error) {
      console.error(error);
      
      // In development mode, provide a guest user instead of error
      if (process.env.NODE_ENV !== 'production') {
        console.log('Token validation failed, but using guest user in development mode');
        req.user = {
          id: require('crypto').randomUUID(),
          name: 'Guest User',
          email: 'guest@example.com',
          isAdmin: false
        };
        next();
        return;
      }
      
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  // In development mode, provide a guest user instead of error
  if (process.env.NODE_ENV !== 'production') {
    console.log('No token provided, but using guest user in development mode');
    req.user = {
      id: require('crypto').randomUUID(),
      name: 'Guest User',
      email: 'guest@example.com',
      isAdmin: false
    };
    next();
    return;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
});

module.exports = { protect, admin };