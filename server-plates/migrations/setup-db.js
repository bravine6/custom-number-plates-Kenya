const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function runMigrations() {
  console.log('Starting database migration...');
  
  // Hard-code the connection details to ensure we use IPv4
  const client = new Client({
    host: 'db.awcyqojhwyvzyltjqnbc.supabase.co',
    user: 'postgres',
    password: 'hbFgA_%SudyM997',
    database: 'postgres',
    port: 5432,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Successfully connected to database');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'supabase-setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL migration script...');
    await client.query(sql);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    await client.end();
  }
}

runMigrations();