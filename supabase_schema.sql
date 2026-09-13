-- Create the perfumes table (Originals)
CREATE TABLE perfumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC(10, 2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the dupes table
CREATE TABLE dupes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_id UUID REFERENCES perfumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC(10, 2),
  similarity_match INTEGER,
  affiliate_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  is_premium BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert some dummy data for testing
INSERT INTO perfumes (id, name, brand, price) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Baccarat Rouge 540', 'Maison Francis Kurkdjian', 325.00);

INSERT INTO dupes (original_id, name, brand, price, similarity_match, affiliate_link)
VALUES ('11111111-1111-1111-1111-111111111111', 'Club de Nuit Untold', 'Armaf', 40.00, 95, 'https://amazon.com/...');
