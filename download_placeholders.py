import urllib.request
import os

categories = ['popular', 'lottery', 'casino', 'slots', 'sports', 'rummy', 'fishing', 'original']
games = ['wingo', 'k3', 'fived', 'trx', 'aviator', 'vortex', 'chickenroad', 'mines', 'moneycoming', 'pg_ganesha_gold', 'pg_ganesha_fortune', 'pg_buffalo_win', 'pg_crypto_gold', 'pg_wild_bounty', 'pg_dragon_hatch', 'jdb_super_niubi', 'jdb_dragon_master', 'jdb_lucky_seven', 'jdb_super_niubi_deluxe', 'jdb_billionaire', 'jdb_dragon_fishing', 'mg_wildfire_wins', 'evo_casino', 'dg_casino', 'playace_casino', 'mg_casino']

os.makedirs('public/assets/categories', exist_ok=True)
os.makedirs('public/assets/games', exist_ok=True)

try:
    for c in categories:
        urllib.request.urlretrieve(f'https://placehold.co/400x300/1e1e1e/d4af37/png?text={c}', f'public/assets/categories/{c}.png')
        print(f"Downloaded {c}.png")

    for g in games:
        urllib.request.urlretrieve(f'https://placehold.co/200x200/1e1e1e/d4af37/png?text={g}', f'public/assets/games/{g}.png')
        print(f"Downloaded {g}.png")
    
    print("All placeholders downloaded successfully!")
except Exception as e:
    print(f"Error: {e}")
