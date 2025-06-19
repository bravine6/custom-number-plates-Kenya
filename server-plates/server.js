const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Initialize express
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware with specific origin for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://custom-number-plates-kenya.vercel.app'] 
    : '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.LAMBDA_TASK_ROOT;

// Determine which database mode to use
const useMockDb = process.env.USE_MOCK_DB === 'true';
const useSupabaseRest = process.env.USE_SUPABASE_REST === 'true';
// Set SKIP_AUTH to true by default in development mode
if (process.env.NODE_ENV !== 'production' && process.env.SKIP_AUTH === undefined) {
  process.env.SKIP_AUTH = 'true';
  console.log('Authentication bypass enabled for development mode');
}

console.log('Database mode:', 
  useMockDb ? 'Mock Database' : 
  useSupabaseRest ? 'Supabase REST API' : 
  'Sequelize + PostgreSQL');
console.log('Authentication mode:', 
  process.env.SKIP_AUTH === 'true' ? 'Bypassed (Development)' : 'Enforced');

// For Vercel or other serverless environments, we'll lazy-load database connections
let sequelize;

const getSequelize = async () => {
  if (!sequelize) {
    try {
      if (useSupabaseRest) {
        // Use the Supabase REST API adapter
        console.log('Using Supabase REST API instead of direct Postgres connection');
        const { sequelize: seq } = require('./config/db');
        sequelize = seq;
        
        // Authenticate to verify connection
        await sequelize.authenticate();
        console.log('Supabase REST API connected successfully');
        
        // No need to sync with Supabase REST API
      } else {
        // Traditional Sequelize connection
        const { sequelize: seq } = require('./config/db');
        sequelize = seq;
        
        // Only authenticate and sync in development
        if (process.env.NODE_ENV !== 'production') {
          await sequelize.authenticate();
          console.log('Database connected successfully');
          
          await sequelize.sync({ alter: true });
          console.log('Database synchronized');
        } else {
          // In production, just authenticate without sync
          await sequelize.authenticate();
          console.log('Database connected successfully');
        }
      }
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
  return sequelize;
};

// Import mock database for fallback
const mockDb = require('./data/mockData');

// Database connection middleware with more intelligent fallback
const dbMiddleware = async (req, res, next) => {
  try {
    // Set the mock database on the request object only if explicitly configured to use it
    // or if Supabase is unavailable
    if (useMockDb) {
      console.log('Using mock database as configured by USE_MOCK_DB=true');
      req.mockDb = mockDb;
    } else if (supabase) {
      // If Supabase is available, don't set mockDb to prevent fallback to mock
      req.supabase = supabase;
      // Set USE_SUPABASE_REST to true to ensure controllers use Supabase
      process.env.USE_SUPABASE_REST = 'true';
    } else {
      // Only use mock as fallback if Supabase is unavailable
      console.log('Supabase unavailable, falling back to mock database');
      req.mockDb = mockDb;
    }
    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    next(error);
  }
};

// Add CORS headers for specific routes
app.use('/api/v1/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Apply database middleware to API routes
app.use('/api/v1/plates', dbMiddleware, require('./routes/plateRoutes'));
app.use('/api/v1/orders', dbMiddleware, require('./routes/orderRoutes'));
app.use('/api/v1/users', dbMiddleware, require('./routes/userRoutes'));

// Catch all route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NTSA Custom Plates API' });
});

// Import Supabase client with error handling
let supabase;
try {
  const supabaseModule = require('./supabase');
  supabase = supabaseModule.supabase;
  
  console.log('Connecting to Supabase at:', process.env.SUPABASE_URL);
  console.log('Using API key:', process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'Not set');
} catch (error) {
  console.error('Error loading Supabase client:', error.message);
  console.log('Using mock database for API operations');
}

// Simple health check route that always works
app.get('/api/v1/health', async (req, res) => {
  try {
    return res.json({
      status: 'ok',
      message: 'API is running',
      database: useMockDb ? 'Mock Database' : 
                useSupabaseRest ? 'Supabase REST API' : 
                'Sequelize + PostgreSQL',
      environment: process.env.NODE_ENV,
      mockDbEnabled: useMockDb,
      authMode: process.env.SKIP_AUTH === 'true' ? 'Bypassed' : 'Enforced',
      plateUniquenessEnforced: true,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Error handler middleware
app.use(errorHandler);

// Only start a server if not in a serverless environment
if (!isServerless) {
  const PORT = process.env.PORT || 9000;
  
  // Database connection and server start
  const startServer = async () => {
    try {
      try {
        await getSequelize();
      } catch (error) {
        console.error('Database connection error:', error);
        console.log('Starting server with mock database fallback');
      }
      
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Server start error:', error);
      process.exit(1);
    }
  };
  
  startServer();
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
  });
}

// Export the Express API for serverless environments
module.exports = app;