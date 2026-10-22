import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.VITE_SUPABASE_URL, supabaseKey);

const ZARA_SLUGS = {
  'deep garden': 'deep-garden-edp-100-ml---3-38-oz-p20130309.html',
  'red temptation': 'red-zara-temptation-edp-80-ml---2-71-fl--oz--p20110972.html',
  'golden decade': 'golden-decade-edp-80-ml---2-71-fl--oz--p20110977.html',
  'gardenia': 'gardenia-edp-90-ml---3-04-oz-p20120824.html',
  'rose gourmand': 'rose-gourmand-edp-80ml--2-71-fl--oz---p20110975.html',
  'applejuice': 'applejuice-edt-90ml---3-04-oz-p20120804.html',
  'orchid': 'orchid-edp-30-ml---1-01-fl--oz--p20120388.html',
  'fields at nightfall': 'fields-at-nightfall-intense-parfum-100-ml---3-38-oz-p20130165.html',
  'vibrant leather': 'vibrant-leather-edp-100-ml---3-38-oz-p20210721.html',
  'vibrant leather bogoss': 'bogoss-vibrant-leather-edp-100-ml---3-38-oz-p20210917.html',
  'bogoss vibrant leather': 'bogoss-vibrant-leather-edp-100-ml---3-38-oz-p20210917.html',
  'sand desert at sunset': 'sand-desert-at-sunset-intense-edp-100-ml---3-38-oz-p20220320.html',
  'waterlily tea dress': 'waterlily-tea-dress-edp-100ml--3-4-fl-oz---p20110944.html',
  'tubereuse noir': 'tubereuse-noir-edp-100ml--3-4-fl-oz---p20110928.html',
  'energetically new york': 'energetically-new-york-edp-100ml--3-4-fl--oz---p20110710.html',
  'supreme vanilla': 'supreme-vanilla-edp-80-ml-p20110389.html',
  'cherry smoothie': 'cherry-smoothie-edp-90-ml---3-04-oz-p20120931.html',
  'nude bouquet': 'nude-bouquet-edp-100-ml---3-38-oz-p20130300.html',
  'violet blossom': 'violet-blossom-edp-90-ml---3-04-oz-p20120927.html',
  'vetiver pamplemousse': 'vetiver-pamplemousse-edp-100ml--3-4-fl--oz--p20110929.html',
  'emotions n°01 vetiver pamplemousse': 'vetiver-pamplemousse-edp-100ml--3-4-fl--oz--p20110929.html',
  'emotions n° 01 - vetiver pamplemousse': 'vetiver-pamplemousse-edp-100ml--3-4-fl--oz--p20110929.html',
  'emotions n*01 - vetiver pamplemousse': 'vetiver-pamplemousse-edp-100ml--3-4-fl--oz--p20110929.html',
  'pink flambe': 'pink-flambe-edt-90-ml---3-04-oz-p20120471.html',
  'seoul': 'seoul-summer-edt-100-ml---3-38-oz-p20210298.html',
  'tobacco collection rich warm addictive': 'tobacco-01-edt-100-ml---3-38-oz-p20210915.html'
};

async function updateZara() {
  const { data: zaraDupes, error } = await supabase.from('dupes').select('*').ilike('brand', '%zara%');
  if (error) {
    console.error('Error fetching Zara dupes:', error);
    return;
  }

  let directCount = 0;
  let categoryCount = 0;

  for (const d of zaraDupes) {
    const key = d.name.toLowerCase().trim();
    const slug = ZARA_SLUGS[key];
    if (slug) {
      const ieUrl = `https://www.zara.com/ie/en/${slug}`;
      const ukUrl = `https://www.zara.com/uk/en/${slug}`;
      await supabase.from('dupes').update({
        affiliate_link: ieUrl,
        uk_affiliate_link: ukUrl
      }).eq('id', d.id);
      directCount++;
    } else {
      const ieUrl = `https://www.zara.com/ie/en/w-fragrances-l1396.html`;
      const ukUrl = `https://www.zara.com/uk/en/w-fragrances-l1396.html`;
      await supabase.from('dupes').update({
        affiliate_link: ieUrl,
        uk_affiliate_link: ukUrl
      }).eq('id', d.id);
      categoryCount++;
    }
  }

  console.log(`Updated all ${zaraDupes.length} Zara dupes:`);
  console.log(`- ${directCount} updated with direct product page URLs!`);
  console.log(`- ${categoryCount} routed to official Zara Fragrances collection!`);
}

updateZara();
