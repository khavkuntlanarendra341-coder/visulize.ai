/**
 * Supabase client for Visualize.AI
 * Handles database connections and operations
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not configured. Using in-memory storage.');
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Initialize database tables if they don't exist
 * Run this on startup to ensure tables are ready
 */
async function initializeTables() {
  if (!supabase) {
    console.log('📦 Supabase not configured, skipping table initialization');
    return false;
  }

  try {
    // Test connection by querying sessions table
    const { error } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('📋 Sessions table does not exist. Please create it in Supabase dashboard.');
      console.log('   Run the SQL from: backend/supabase-schema.sql');
      return false;
    }

    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }

    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Failed to initialize Supabase:', err.message);
    return false;
  }
}

module.exports = {
  supabase,
  initializeTables,
};
