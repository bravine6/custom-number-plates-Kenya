const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function runMigrations() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to database:', process.env.DATABASE_URL);
  
  // Create a connection pool with proper SSL configuration
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Simplified connection options
    user: 'postgres',
    password: 'bravinecheru',  // Updated password from .env
    database: 'postgres',
    port: 5432,
    // Add connection timeouts
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 5
  });

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'supabase-setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Connect to the database
    const client = await pool.connect();
    
    console.log('Connected to database. Running migrations...');
    
    // Execute the SQL statements
    await client.query(sql);
    
    console.log('Migrations completed successfully!');
    
    // Release the client
    client.release();
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    // End the pool
    await pool.end();
  }
}

runMigrations();