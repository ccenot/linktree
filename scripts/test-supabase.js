import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('Testing Supabase Connection...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data, error } = await supabase.from('profile_config').select('*');
    console.log('Select Result:', { data, error });
  } catch (e) {
    console.error('Error during select:', e);
  }
}

run();
