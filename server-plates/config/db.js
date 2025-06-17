const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Ensure the pg package is loaded for PostgreSQL
try {
  require('pg');
} catch (e) {
  console.error('pg package is required for PostgreSQL connection');
  throw new Error('Please install pg package manually');
}

// Create Sequelize instance with better error handling for serverless environments
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 2,
    min: 0,
    idle: 0,
    acquire: 3000,
    evict: 30000
  }
});

module.exports = { sequelize };