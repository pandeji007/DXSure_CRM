const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testInsert() {
  const lead = {
    title: 'Test Lead',
    contact_name: 'Test Name',
    status: 'new',
    priority: 'medium'
  };
  console.log('Inserting lead...');
  const res = await supabase.from('leads').insert(lead).select().single();
  console.log('Result:', JSON.stringify(res, null, 2));
}

testInsert();
