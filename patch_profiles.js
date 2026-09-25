import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

const effectTarget = `    const fetchProfile = async (userId) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    };`;

const effectReplacement = `    const fetchProfile = async (userId) => {
      let { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
      // If profile doesn't exist yet, auto-create it
      if (!data) {
        const { data: newProfile, error } = await supabase.from('profiles').insert([{ id: userId, tier: 'free' }]).select().single();
        if (!error) data = newProfile;
      }
      
      if (data) setProfile(data);
    };`;

content = content.replace(effectTarget, effectReplacement);
fs.writeFileSync('src/App.jsx', content);
