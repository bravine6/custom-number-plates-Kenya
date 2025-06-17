// Supabase client for direct API access
const { createClient } = require('@supabase/supabase-js');

// Supabase project URL and anon key
const supabaseUrl = 'https://awcyqojhwyvzyltjqnbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Y3lxb2pod3l2enlsdGpxbmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUxMjY0NTcsImV4cCI6MTk5MDcwMjQ1N30.kHgrXcLF8oU0yC0t5_T27jAC85Ii_LXBk-3kZzpwfhA';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };