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

// CORS middleware
app.use(cors());

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

// API routes
app.use('/api/v1/plates', require('./routes/plateRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));

// Catch all route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NTSA Custom Plates API' });
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