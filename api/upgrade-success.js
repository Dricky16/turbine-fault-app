import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
    const { userId } = req.body;
    await supabase.from('profiles').update({ tier: 'premium' }).eq('id', userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
