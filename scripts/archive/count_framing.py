import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("No Supabase credentials found in env.")
    # let's try to load from tracenews-api/.env
    from dotenv import load_dotenv
    load_dotenv("/Users/emekaabraham/Downloads/tracenews-api/.env")
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Still no credentials.")
    exit(1)

supabase = create_client(url, key)

res = supabase.table("clusters").select("id", count="exact").gte("created_at", "2026-07-09T00:00:00Z").not_.is_("framing_cache", "null").execute()
print(f"Count of framed clusters since July 9: {res.count}")
