const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Supabase connection parameters
const supabaseUrl = process.env.SUPABASE_URL || 'https://awcyqojhwyvzyltjqnbc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Y3lxb2pod3l2enlsdGpxbmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjcxNjgsImV4cCI6MjA2NTcwMzE2OH0.FunreBEOVCRE_9kfD8iE0QnCq9lPw6ldFn3gPVVnlg8';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('Creating tables in Supabase...');
  
  try {
    // Create tables directly using SQL-like commands via RPC functions
    console.log('Creating tables directly...');
    
    // Create users table
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (userError && userError.code === '42P01') {
        console.log('Creating users table...');
        const { error } = await supabase.rpc('create_users_table', {
          sql: `
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name VARCHAR(100) NOT NULL,
              email VARCHAR(100) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              phone VARCHAR(20),
              idNumber VARCHAR(50),
              address VARCHAR(255),
              city VARCHAR(100),
              isAdmin BOOLEAN DEFAULT false,
              role VARCHAR(20) DEFAULT 'user',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `
        });
        
        if (error) {
          console.error('Error creating users table:', error);
        } else {
          console.log('Users table created successfully');
        }
      } else {
        console.log('Users table already exists');
      }
    } catch (err) {
      console.error('Error checking users table:', err);
    }
    
    // Create plates table
    try {
      const { data: plateData, error: plateError } = await supabase
        .from('plates')
        .select('*')
        .limit(1);
      
      if (plateError && plateError.code === '42P01') {
        console.log('Creating plates table...');
        const { error } = await supabase.rpc('create_plates_table', {
          sql: `
            CREATE TABLE IF NOT EXISTS plates (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              plateType VARCHAR(50) NOT NULL,
              text VARCHAR(10) NOT NULL,
              price DECIMAL(10, 2) NOT NULL,
              previewUrl VARCHAR(255),
              description TEXT,
              isAvailable BOOLEAN DEFAULT true,
              backgroundIndex INTEGER,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `
        });
        
        if (error) {
          console.error('Error creating plates table:', error);
        } else {
          console.log('Plates table created successfully');
        }
      } else {
        console.log('Plates table already exists');
      }
    } catch (err) {
      console.error('Error checking plates table:', err);
    }
    
    // Create orders table
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
      
      if (orderError && orderError.code === '42P01') {
        console.log('Creating orders table...');
        const { error } = await supabase.rpc('create_orders_table', {
          sql: `
            CREATE TABLE IF NOT EXISTS orders (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              userId UUID NOT NULL,
              totalAmount DECIMAL(10, 2) NOT NULL,
              shippingMethod VARCHAR(20) DEFAULT 'free',
              shippingCost DECIMAL(10, 2) DEFAULT 0,
              status VARCHAR(20) DEFAULT 'pending',
              paymentMethod VARCHAR(20),
              paymentId VARCHAR(255),
              address VARCHAR(255),
              city VARCHAR(100),
              phoneNumber VARCHAR(20),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `
        });
        
        if (error) {
          console.error('Error creating orders table:', error);
        } else {
          console.log('Orders table created successfully');
        }
      } else {
        console.log('Orders table already exists');
      }
    } catch (err) {
      console.error('Error checking orders table:', err);
    }
    
    // Create orderitems table
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('orderitems')
        .select('*')
        .limit(1);
      
      if (itemError && itemError.code === '42P01') {
        console.log('Creating orderitems table...');
        const { error } = await supabase.rpc('create_orderitems_table', {
          sql: `
            CREATE TABLE IF NOT EXISTS orderitems (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              orderId UUID NOT NULL,
              plateId UUID NOT NULL,
              quantity INTEGER DEFAULT 1,
              price DECIMAL(10, 2) NOT NULL,
              plateText VARCHAR(20) NOT NULL,
              plateType VARCHAR(50) NOT NULL,
              previewUrl VARCHAR(255),
              backgroundIndex INTEGER,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
          `
        });
        
        if (error) {
          console.error('Error creating orderitems table:', error);
        } else {
          console.log('OrderItems table created successfully');
        }
      } else {
        console.log('OrderItems table already exists');
      }
    } catch (err) {
      console.error('Error checking orderitems table:', err);
    }
    
    console.log('Table creation completed');
    
    // Insert initial data
    console.log('Inserting initial data...');
    
    // Insert admin user
    const { error: adminError } = await supabase
      .from('users')
      .upsert([
        {
          name: 'Admin User',
          email: 'admin@plates.com',
          password: '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOSsJTWR3K4Pw2xx1l8HXgnLwD.Ne', // admin123
          role: 'admin',
          isAdmin: true,
          phone: '0700000000',
          idNumber: 'ADMIN001'
        }
      ]);
      
    if (adminError) {
      console.error('Error inserting admin user:', adminError);
    } else {
      console.log('Admin user created or updated');
    }
    
    // Insert sample plates
    const { error: plateError } = await supabase
      .from('plates')
      .upsert([
        {
          name: 'Standard Plate',
          description: 'Regular Kenyan number plate',
          base_price: 5000.00,
          type: 'standard',
          features: { colors: ['white', 'black'], materials: ['aluminum'] }
        },
        {
          name: 'Personalized Plate',
          description: 'Custom text on your plate',
          base_price: 15000.00,
          type: 'personalized',
          features: { colors: ['white', 'black', 'blue'], materials: ['aluminum', 'carbon-fiber'] }
        },
        {
          name: 'Vintage Plate',
          description: 'Classic design for vintage vehicles',
          base_price: 8000.00,
          type: 'vintage',
          features: { colors: ['cream', 'black'], materials: ['aluminum'] }
        }
      ]);
      
    if (plateError) {
      console.error('Error inserting sample plates:', plateError);
    } else {
      console.log('Sample plates created or updated');
    }
    
    console.log('Initial data insertion completed');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTables();