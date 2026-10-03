import os
import re
import time
import json
import urllib.request
import urllib.parse
from supabase import create_client, Client

from dotenv import load_dotenv
load_dotenv('.env.local')

url: str = os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def get_image(query):
    try:
        q = urllib.parse.quote_plus(query)
        req = urllib.request.Request(
            f"https://html.duckduckgo.com/html/?q={q}&ia=images&iax=images",
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        match = re.search(r'vqd=([\d-]+)', html)
        if not match: return None
        vqd = match.group(1)
        
        req = urllib.request.Request(
            f"https://duckduckgo.com/i.js?l=us-en&o=json&q={q}&vqd={vqd}&f=,,,&p=1",
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        data = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        results = json.loads(data)
        if 'results' in results and len(results['results']) > 0:
            return results['results'][0]['image']
    except Exception as e:
        print(f"Error for {query}: {e}")
    return None

def run():
    print("Fetching original images...")
    origs = supabase.table('perfumes').select('id, name, brand, image_url').execute()
    for o in origs.data:
        if not o['image_url'] or 'notino' in o['image_url'] or 'unsplash' in o['image_url']:
            img = get_image(f"{o['brand']} {o['name']} perfume bottle isolated white background")
            if img:
                supabase.table('perfumes').update({'image_url': img}).eq('id', o['id']).execute()
                print(f"✅ {o['name']}: {img[:60]}")
            time.sleep(1.5)

    print("Fetching dupe images...")
    dupes = supabase.table('dupes').select('id, name, brand, image_url').execute()
    for d in dupes.data:
        if not d['image_url'] or 'notino' in d['image_url'] or 'unsplash' in d['image_url']:
            img = get_image(f"{d['brand']} {d['name']} perfume bottle isolated white background")
            if img:
                supabase.table('dupes').update({'image_url': img}).eq('id', d['id']).execute()
                print(f"✅ {d['name']}: {img[:60]}")
            time.sleep(1.5)

run()
