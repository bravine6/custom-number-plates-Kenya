const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Supabase connection parameters
const supabaseUrl = process.env.SUPABASE_URL || 'https://awcyqojhwyvzyltjqnbc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Y3lxb2pod3l2enlsdGpxbmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjcxNjgsImV4cCI6MjA2NTcwMzE2OH0.FunreBEOVCRE_9kfD8iE0QnCq9lPw6ldFn3gPVVnlg8';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixColumns() {
  console.log('Fixing user table columns...');
  
  try {
    // Step 1: Check and fix idNumber column
    console.log('Step 1: Fixing idNumber column...');
    
    // First check if any rows have NULL idNumber
    const { data: nullIdNumbers, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .is('idNumber', null);
      
    if (checkError) {
      console.error('Error checking for NULL idNumbers:', checkError);
    } else {
      // If there are rows with NULL idNumber, update them with a temporary value
      if (nullIdNumbers && nullIdNumbers.length > 0) {
        console.log(`Found ${nullIdNumbers.length} users with NULL idNumber, updating with temporary values...`);
        
        for (const user of nullIdNumbers) {
          const tempIdNumber = `TEMP_${user.id.substring(0, 8)}`;
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ idNumber: tempIdNumber })
            .eq('id', user.id);
            
          if (updateError) {
            console.error(`Error updating user ${user.email} with temp idNumber:`, updateError);
          } else {
            console.log(`Updated user ${user.email} with temporary idNumber: ${tempIdNumber}`);
          }
        }
      } else {
        console.log('No users with NULL idNumber found');
      }
    }
    
    // Step 2: Check and fix isAdmin column
    console.log('\nStep 2: Fixing isAdmin column...');
    
    // Check if the isAdmin column exists
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_column_info', { table_name: 'users', column_name: 'isAdmin' });
      
    if (tableError || !tableInfo || tableInfo.length === 0) {
      console.log('isAdmin column may not exist or there was an error checking it:', tableError);
      
      console.log('Attempting to add or correct isAdmin column...');
      
      // Try to modify the isAdmin column or add it if it doesn't exist
      const { error: isAdminError } = await supabase.rpc('fix_isadmin_column', {
        sql: `
          -- Check if isAdmin column exists
          DO $$
          BEGIN
            -- If column doesn't exist, add it
            IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'isAdmin'
            ) THEN
              ALTER TABLE users ADD COLUMN "isAdmin" BOOLEAN DEFAULT false;
              
              -- Set admin users based on the role column
              UPDATE users SET "isAdmin" = true WHERE role = 'admin';
            END IF;
            
            -- Make sure it has the default value
            ALTER TABLE users ALTER COLUMN "isAdmin" SET DEFAULT false;
          END
          $$;
        `
      });
      
      if (isAdminError) {
        console.error('Error fixing isAdmin column:', isAdminError);
      } else {
        console.log('Successfully fixed isAdmin column');
      }
    } else {
      console.log('isAdmin column exists, making sure it has the correct default value...');
      
      // Ensure isAdmin has correct default value
      const { error: defaultError } = await supabase.rpc('set_column_default', {
        sql: `ALTER TABLE users ALTER COLUMN "isAdmin" SET DEFAULT false;`
      });
      
      if (defaultError) {
        console.error('Error setting isAdmin default value:', defaultError);
      } else {
        console.log('Successfully set isAdmin default value to false');
      }
    }
    
    // Step 3: Run final schema adjustments
    console.log('\nStep 3: Running final schema adjustments...');
    
    const { error: finalError } = await supabase.rpc('run_final_adjustments', {
      sql: `
        -- Make sure idNumber is NOT NULL
        ALTER TABLE users ALTER COLUMN "idNumber" SET NOT NULL;
        
        -- Add unique constraint if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.constraint_column_usage 
            WHERE table_name = 'users' AND column_name = 'idNumber' AND constraint_name LIKE '%unique%'
          ) THEN
            ALTER TABLE users ADD CONSTRAINT unique_idnumber UNIQUE ("idNumber");
          END IF;
        END
        $$;
        
        -- Update schema cache
        NOTIFY pgrst, 'reload schema';
      `
    });
    
    if (finalError) {
      console.error('Error running final schema adjustments:', finalError);
      
      // If the RPC fails, suggest manual execution
      console.log('\nIf the above errors persist, please run these SQL commands directly in the Supabase SQL editor:');
      console.log(`
        -- Fix idNumber column
        UPDATE users SET "idNumber" = 'TEMP_' || substring(id::text, 1, 8) WHERE "idNumber" IS NULL;
        ALTER TABLE users ALTER COLUMN "idNumber" SET NOT NULL;
        ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS unique_idnumber UNIQUE ("idNumber");
        
        -- Fix isAdmin column
        -- If column doesn't exist, add it
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'isAdmin'
          ) THEN
            ALTER TABLE users ADD COLUMN "isAdmin" BOOLEAN DEFAULT false;
          END IF;
          
          -- Make sure it has the default value
          ALTER TABLE users ALTER COLUMN "isAdmin" SET DEFAULT false;
          
          -- Set admin users based on the role column
          UPDATE users SET "isAdmin" = true WHERE role = 'admin';
        END
        $$;
        
        -- Update schema cache
        NOTIFY pgrst, 'reload schema';
      `);
    } else {
      console.log('Successfully completed all schema adjustments');
    }
    
    console.log('\nDatabase schema fix completed. You should now be able to register users.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixColumns();