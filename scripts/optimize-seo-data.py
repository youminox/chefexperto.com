import json
import os
import re
import html

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS_PATH = os.path.join(ROOT_DIR, "data", "posts.json")
CATEGORIES_PATH = os.path.join(ROOT_DIR, "data", "categories.json")
SEARCH_INDEX_PATH = os.path.join(ROOT_DIR, "public", "search-index.json")

with open(POSTS_PATH, "r", encoding="utf-8") as f:
    posts = json.load(f)

with open(CATEGORIES_PATH, "r", encoding="utf-8") as f:
    categories = json.load(f)

print(f"Initial posts count: {len(posts)}")

def clean_title(title: str) -> str:
    if not title:
        return ""
    t = html.unescape(title).strip()
    # Strip wrapping backticks or quotes
    t = t.strip("`\"' ")
    # Remove "| Opción #228 Ideal" or "| Opción #228" at end
    t = re.sub(r"\s*\|\s*(?:La\s+)?Opci[oó]n\s+(?:Ideal\s+)?#?\d+(?:\s+Ideal)?\s*$", "", t, flags=re.I)
    # Replace "La Opción #232 Ideal" or "La Opción Ideal #224" -> "Opción Ideal"
    t = re.sub(r"\bLa\s+Opci[oó]n\s+#?\d+\s+(Ideal|Perfecta)\b", r"Guía \1", t, flags=re.I)
    t = re.sub(r"\bLa\s+Opci[oó]n\s+(Ideal|Perfecta)\s+#?\d+\b", r"Guía \1", t, flags=re.I)
    t = re.sub(r"\bOpci[oó]n\s+#?\d+\s+(Ideal|Perfecta)\b", r"Guía \1", t, flags=re.I)
    t = re.sub(r"\bOpci[oó]n\s+#?\d+\b", "Guía Práctica", t, flags=re.I)
    # Replace "Receta #232: " -> "Receta: " or "Receta #232 de " -> "Receta de "
    t = re.sub(r"\bReceta\s+#\d+\s*:\s*", "Receta: ", t, flags=re.I)
    t = re.sub(r"\bReceta\s+#\d+\b", "Receta", t, flags=re.I)
    t = re.sub(r"\s+#\d+\b", "", t)
    # Fix typo "Adultores Mayores" -> "Adultos Mayores"
    t = re.sub(r"\bAdultores\b", "Adultos", t)
    # Update 2023 / 2024 to 2026
    t = re.sub(r"\b202[34]\b", "2026", t)
    # Normalize spaces
    t = re.sub(r"\s{2,}", " ", t).strip()
    return t

def generate_clean_excerpt(content_html: str, max_length: int = 155) -> str:
    if not content_html:
        return ""
    # Remove noscript (e.g. Play on YouTube) and video-container
    cleaned = re.sub(r"<noscript>.*?</noscript>", " ", content_html, flags=re.I | re.S)
    # Extract paragraph contents first for natural sentences without H2 titles glued
    paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", cleaned, flags=re.I | re.S)
    if paragraphs:
        text_source = " ".join(paragraphs[:3])
    else:
        text_source = cleaned
    # Replace tags with space so words never stick together
    text = re.sub(r"<[^>]*>", " ", text_source)
    text = html.unescape(text)
    text = text.replace("Play on YouTube", " ")
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= max_length:
        return text
    truncated = text[:max_length]
    last_space = truncated.rfind(" ")
    if last_space > max_length * 0.6:
        truncated = truncated[:last_space]
    return truncated.rstrip(".,;: ") + "..."

def clean_content_html(content_html: str) -> str:
    if not content_html:
        return ""
    # Update 2023/2024 in headings inside content to 2026
    def repl_heading(m):
        return re.sub(r"\b202[34]\b", "2026", m.group(0))
    c = re.sub(r"<h[23][^>]*>.*?</h[23]>", repl_heading, content_html, flags=re.I | re.S)
    return c

cleaned_posts = []
removed_empty = 0
removed_dup_blog = 0
seen_blog_platos = False
titles_updated = 0
excerpts_updated = 0

for post in posts:
    raw_content = post.get("content", "")
    plain_words = re.sub(r"<[^>]*>", " ", raw_content).replace("Play on YouTube", " ").split()
    if len(plain_words) < 50:
        removed_empty += 1
        continue

    if post.get("category") == "blog" and "platos de comida" in post.get("title", "").lower():
        if seen_blog_platos:
            removed_dup_blog += 1
            continue
        seen_blog_platos = True

    old_title = post.get("title", "")
    new_title = clean_title(old_title)
    if new_title != old_title:
        titles_updated += 1
    post["title"] = new_title

    post["content"] = clean_content_html(raw_content)

    old_excerpt = post.get("excerpt", "")
    new_excerpt = generate_clean_excerpt(post["content"])
    if new_excerpt and new_excerpt != old_excerpt:
        post["excerpt"] = new_excerpt
        excerpts_updated += 1

    cleaned_posts.append(post)

# Recalculate category counts
for cat in categories:
    cat["count"] = 0

cat_map = {c["slug"]: c for c in categories}
for post in cleaned_posts:
    seen_cats = set()
    if post.get("category") in cat_map:
        seen_cats.add(post["category"])
    for pc in post.get("categories", []):
        if pc.get("slug") in cat_map:
            seen_cats.add(pc["slug"])
    for c_slug in seen_cats:
        cat_map[c_slug]["count"] += 1

active_categories = [c for c in categories if c["count"] > 0]

# Save updated posts.json and categories.json
with open(POSTS_PATH, "w", encoding="utf-8") as f:
    json.dump(cleaned_posts, f, ensure_ascii=False, indent=2)

with open(CATEGORIES_PATH, "w", encoding="utf-8") as f:
    json.dump(active_categories, f, ensure_ascii=False, indent=2)

# Regenerate public/search-index.json
search_index = [
    {
        "t": p["title"],
        "s": p["slug"],
        "c": p["category"],
        "n": p.get("categoryName") or p["category"],
    }
    for p in cleaned_posts
]
with open(SEARCH_INDEX_PATH, "w", encoding="utf-8") as f:
    json.dump(search_index, f, ensure_ascii=False)

print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"✅ Removed empty stub posts (<50w): {removed_empty}")
print(f"✅ Removed duplicate /blog/ posts:  {removed_dup_blog}")
print(f"✅ Titles cleaned & updated:        {titles_updated}")
print(f"✅ Excerpts regenerated cleanly:    {excerpts_updated}")
print(f"✅ Final valid posts count:         {len(cleaned_posts)}")
print(f"✅ Active categories count:         {len(active_categories)}")
print(f"✅ Regenerated search-index.json:   {len(search_index)} items")
