// Supabase client for direct API access
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Supabase project URL and anon key from environment variables
// Fallback to hardcoded values for development if env vars not set
const supabaseUrl = process.env.SUPABASE_URL || 'https://awcyqojhwyvzyltjqnbc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Y3lxb2pod3l2enlsdGpxbmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUxMjY0NTcsImV4cCI6MTk5MDcwMjQ1N30.kHgrXcLF8oU0yC0t5_T27jAC85Ii_LXBk-3kZzpwfhA';

// Log connection details in development to help with debugging
if (process.env.NODE_ENV !== 'production') {
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  console.log(`Using API key: ${supabaseKey.substring(0, 10)}...`);
}

// Initialize Supabase client with additional options for better reliability
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});

// Test connection and log result
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection test succeeded');
    return true;
  } catch (err) {
    console.error('Supabase connection test exception:', err);
    return false;
  }
};

// Run test in the background
testConnection();

module.exports = { supabase };