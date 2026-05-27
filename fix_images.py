import re
import random

# Unsplash collection of gaming/casino/abstract images
unsplash_urls = [
    "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=500&q=80",
    "https://images.unsplash.com/photo-1595568579083-d92e59e51921?w=500&q=80",
    "https://images.unsplash.com/photo-1518622115598-a28cb7e42d99?w=500&q=80",
    "https://images.unsplash.com/photo-1511117833845-aa2b06992d9f?w=500&q=80",
    "https://images.unsplash.com/photo-1606167668511-22c51466d15c?w=500&q=80",
    "https://images.unsplash.com/photo-1614680376593-902f74a77e5e?w=500&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500&q=80",
    "https://images.unsplash.com/photo-1629813358327-0248f76e1a91?w=500&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80",
    "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=500&q=80",
    "https://images.unsplash.com/photo-1533228100845-08145b01de14?w=500&q=80",
]

def get_random_img():
    return random.choice(unsplash_urls)

categories_mapping = {
    "popular": "https://images.unsplash.com/photo-1606167668511-22c51466d15c?w=500&q=80",
    "lottery": "https://images.unsplash.com/photo-1518622115598-a28cb7e42d99?w=500&q=80",
    "casino": "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=500&q=80",
    "slots": "https://images.unsplash.com/photo-1595568579083-d92e59e51921?w=500&q=80",
    "sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80",
    "rummy": "https://images.unsplash.com/photo-1511117833845-aa2b06992d9f?w=500&q=80",
    "fishing": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80",
    "original": "https://images.unsplash.com/photo-1614680376593-902f74a77e5e?w=500&q=80",
}

# Fix lobby/page.tsx
lobby_path = r'src/app/lobby/page.tsx'
with open(lobby_path, 'r', encoding='utf-8') as f:
    lobby_content = f.read()

for cat, url in categories_mapping.items():
    lobby_content = re.sub(f'"/assets/categories/{cat}\\.png"', f'"{url}"', lobby_content)

with open(lobby_path, 'w', encoding='utf-8') as f:
    f.write(lobby_content)

# Fix mockData.ts
mock_path = r'src/constants/mockData.ts'
with open(mock_path, 'r', encoding='utf-8') as f:
    mock_content = f.read()

def replacer(match):
    return f'"{get_random_img()}"'

mock_content = re.sub(r'"/assets/games/[^"]+\.png"', replacer, mock_content)

with open(mock_path, 'w', encoding='utf-8') as f:
    f.write(mock_content)

print("Images fixed!")
