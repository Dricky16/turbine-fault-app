import urllib.request
import re

def get_fragrantica_img(query):
    try:
        q = urllib.parse.quote_plus("site:fragrantica.com/perfume/ " + query)
        req = urllib.request.Request(
            f"https://html.duckduckgo.com/html/?q={q}",
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        match = re.search(r'fragrantica\.com/perfume/.*?-(\d+)\.html', html)
        if match:
            frag_id = match.group(1)
            return f"https://fimgs.net/mdimg/perfume/375x500.{frag_id}.jpg"
    except Exception as e:
        print(e)
    return None

print(get_fragrantica_img("Creed Aventus"))
