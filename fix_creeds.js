import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const updates = [
    { name: 'Aventus', brand: 'Creed', img: 'https://fimgs.net/mdimg/perfume/375x500.9828.jpg' },
    { name: 'Aventus for Her', img: 'https://fimgs.net/mdimg/perfume/375x500.38006.jpg' },
    { name: 'Millesime Imperial', img: 'https://fimgs.net/mdimg/perfume/375x500.4230.jpg' },
    { name: 'Silver Mountain Water', img: 'https://fimgs.net/mdimg/perfume/375x500.472.jpg' },
    { name: 'Crystal Noir', img: 'https://fimgs.net/mdimg/perfume/375x500.631.jpg' },
    { name: 'Daisy', img: 'https://fimgs.net/mdimg/perfume/375x500.1361.jpg' },
    { name: 'Delina', img: 'https://fimgs.net/mdimg/perfume/375x500.43871.jpg' },
    { name: 'Cologne 352', img: 'https://fimgs.net/mdimg/perfume/375x500.24584.jpg' },
    { name: 'Davidoff Cool Water', img: 'https://fimgs.net/mdimg/perfume/375x500.507.jpg' }
  ];

  for (const u of updates) {
    if (u.brand) {
      await supabase.from('perfumes').update({ image_url: u.img }).eq('name', u.name).eq('brand', u.brand);
    } else {
      await supabase.from('perfumes').update({ image_url: u.img }).eq('name', u.name);
    }
  }
  console.log("Creeds fixed.");
}
run();
