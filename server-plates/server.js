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

// For Vercel or other serverless environments, we'll lazy-load database connections
let sequelize;

const getSequelize = async () => {
  if (!sequelize) {
    try {
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
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
  return sequelize;
};

// Database connection middleware
const dbMiddleware = async (req, res, next) => {
  try {
    if (!sequelize) {
      await getSequelize();
    }
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// Apply database middleware to API routes
app.use('/api/v1/plates', dbMiddleware, require('./routes/plateRoutes'));
app.use('/api/v1/orders', dbMiddleware, require('./routes/orderRoutes'));
app.use('/api/v1/users', dbMiddleware, require('./routes/userRoutes'));

// Catch all route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NTSA Custom Plates API' });
});

// Health check route with database connection test
app.get('/api/v1/health', async (req, res) => {
  try {
    if (!sequelize) {
      await getSequelize();
    }
    await sequelize.authenticate();
    res.json({ 
      status: 'ok',
      message: 'API is running and database is connected',
      database: 'Supabase',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection error',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
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
      await getSequelize();
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