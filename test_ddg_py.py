from duckduckgo_search import DDGS

def get_first_link(query):
    with DDGS() as ddgs:
        results = ddgs.text(query, max_results=1)
        for r in results:
            print(r['href'])

get_first_link('site:notino.ie "Blue Talisman" perfume')
