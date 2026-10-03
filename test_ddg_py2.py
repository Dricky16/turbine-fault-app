from duckduckgo_search import DDGS
with DDGS() as ddgs:
    res = ddgs.text("site:notino.ie Perry Ellis 360 Red", max_results=2)
    print(res)
