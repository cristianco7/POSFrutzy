import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function formatOrdersTable() {
  console.log('Adding archived_date column to orders table...');

  // Use raw SQL to add the column if not exists
  const { error } = await supabase.rpc('run_sql', {
    sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS archived_date timestamptz;`
  });

  if (error) {
     // Fallback for permissions
     console.log('RPC failed (might not exist). Use this SQL in the Supabase SQL Editor manually:');
     console.log(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS archived_date timestamptz;`);
  } else {
     console.log('Column added successfully!');
  }
}

formatOrdersTable();
