const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

// Supabase configuration - Use Supabase REST API instead of direct Postgres connection
const supabaseUrl = process.env.SUPABASE_URL || 'https://awcyqojhwyvzyltjqnbc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Y3lxb2pod3l2enlsdGpxbmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjcxNjgsImV4cCI6MjA2NTcwMzE2OH0.FunreBEOVCRE_9kfD8iE0QnCq9lPw6ldFn3gPVVnlg8';

// Initialize Supabase client
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Log connection attempt
console.log(`Initializing Supabase client at: ${supabaseUrl}`);

// Create a mock Sequelize instance that will be compatible with existing code
// but actually use Supabase REST API under the hood
class SupabaseSequelize {
  constructor() {
    this.models = {};
    this.supabaseClient = supabaseClient;
  }

  // Emulate Sequelize's authenticate method
  async authenticate() {
    try {
      // Test connection with a simple query
      const { data, error } = await this.supabaseClient.from('users').select('count');
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        throw new Error('Could not connect to Supabase');
      }
      
      console.log('Supabase connection test succeeded');
      return true;
    } catch (err) {
      console.error('Supabase connection error:', err);
      throw err;
    }
  }

  // Emulate Sequelize's sync method
  async sync() {
    console.log('Mock sync - tables should be created manually in Supabase');
    return true;
  }

  // For model definition compatibility
  define(modelName, attributes, options) {
    // Create a simple model object that will be used as a reference
    this.models[modelName] = { tableName: modelName.toLowerCase(), attributes };
    return this.models[modelName];
  }
}

// Create instance of our custom Sequelize-like class
const sequelize = new SupabaseSequelize();

module.exports = { 
  sequelize,
  supabaseClient // Export the Supabase client for direct use
};