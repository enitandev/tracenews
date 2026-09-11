import sys
import os

def patch_worker():
    file_path = "/Users/emekaabraham/Downloads/tracenews-api/app/worker.py"
    with open(file_path, "r") as f:
        content = f.read()

    target = """        else:
            logger.info("[worker] Skipping daily briefing (outside 05-07 UTC window).")

        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()"""
        
    replacement = """        else:
            logger.info("[worker] Skipping daily briefing (outside 05-07 UTC window).")

        # 7. Update public one-tier feed (Cache for Reader Summary & Admin Overview)
        logger.info("[worker] === PUBLIC FEED CACHING ===")
        try:
            from app.routers.monitoring_spirit_admin import list_current_verdicts
            import asyncio
            loop = asyncio.get_event_loop()
            verdicts = loop.run_until_complete(list_current_verdicts("bypass"))
            public_one_tier = [v for v in verdicts if v.get("verdict") == "dark"][:5]
            
            now_iso = datetime.now(timezone.utc).isoformat()
            # Cache the full verdicts for admin overview
            supabase.table("public_feeds").upsert({
                "feed_key": "monitoring_spirit_verdicts",
                "payload": verdicts,
                "computed_at": now_iso
            }).execute()
            
            # Cache the 5 stories for reader summary
            supabase.table("public_feeds").upsert({
                "feed_key": "public_one_tier_stories",
                "payload": public_one_tier,
                "computed_at": now_iso
            }).execute()
            logger.info("[worker] Public feeds cached.")
        except Exception as e:
            logger.error(f"[worker] Feed caching failed: {e}")

        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()"""

    if target in content:
        content = content.replace(target, replacement)
        with open(file_path, "w") as f:
            f.write(content)
        print("Patched worker.py")
    else:
        print("Failed to patch worker.py: target not found")

def patch_reader():
    file_path = "/Users/emekaabraham/Downloads/tracenews-api/app/routers/reader.py"
    with open(file_path, "r") as f:
        content = f.read()

    target = """        # Public one-tier stories
        from app.routers.monitoring_spirit_admin import list_current_verdicts
        verdicts = await list_current_verdicts("bypass")
        public_one_tier = [v for v in verdicts if v["verdict"] == "dark"][:5]
        
        total_opened = counts["govt"] + counts["mainstream"] + counts["watchdog"]
        
        return {
            "counters": {
                "stories_opened": total_opened,
                "broadly_covered": counts["broad"],
                "one_tier_only": counts["partial"],
                "following": follow_count
            },
            "tier_distribution": counts,
            "consent_granted": consent_granted,
            "public_one_tier_stories": public_one_tier,
            "alerts": []
        }"""
        
    replacement = """        # Public one-tier stories from cache
        feed_res = supabase.table("public_feeds").select("payload, computed_at").eq("feed_key", "public_one_tier_stories").execute()
        if feed_res.data:
            public_one_tier = feed_res.data[0]["payload"]
            computed_at = feed_res.data[0]["computed_at"]
        else:
            public_one_tier = []
            computed_at = None
        
        total_opened = counts["govt"] + counts["mainstream"] + counts["watchdog"]
        
        return {
            "counters": {
                "stories_opened": total_opened,
                "broadly_covered": counts["broad"],
                "one_tier_only": counts["partial"],
                "following": follow_count
            },
            "tier_distribution": counts,
            "consent_granted": consent_granted,
            "public_one_tier_stories": public_one_tier,
            "public_one_tier_computed_at": computed_at,
            "alerts": []
        }"""

    if target in content:
        content = content.replace(target, replacement)
        with open(file_path, "w") as f:
            f.write(content)
        print("Patched reader.py")
    else:
        print("Failed to patch reader.py: target not found")

def patch_admin_overview():
    file_path = "/Users/emekaabraham/Downloads/tracenews-api/app/routers/admin_overview.py"
    with open(file_path, "r") as f:
        content = f.read()

    target = """    from app.routers.monitoring_spirit_admin import list_current_verdicts
    verdicts_data = await list_current_verdicts(_)"""
    
    replacement = """    feed_res = supabase.table("public_feeds").select("payload").eq("feed_key", "monitoring_spirit_verdicts").execute()
    verdicts_data = feed_res.data[0]["payload"] if feed_res.data else []"""

    if target in content:
        content = content.replace(target, replacement)
        with open(file_path, "w") as f:
            f.write(content)
        print("Patched admin_overview.py")
    else:
        print("Failed to patch admin_overview.py: target not found")

def patch_framer():
    file_path = "/Users/emekaabraham/Downloads/tracenews-api/app/framer.py"
    with open(file_path, "r") as f:
        content = f.read()

    target = """def run_framing_job():
    \"\"\"Scheduled job to preemptively generate AI framings for recent clusters.\"\"\"
    try:"""
    
    replacement = """def run_framing_job():
    \"\"\"Scheduled job to preemptively generate AI framings for recent clusters.\"\"\"
    # NOTE FOR FUTURE REVIVAL:
    # 55,478 clusters were framed against 28k total clusters because this job 
    # NEVER checks if framing_cache is already populated properly before attempting.
    # When reviving this feature, ADD A CHECK to ensure framing_cache is actually empty!
    try:"""

    if target in content:
        content = content.replace(target, replacement)
        with open(file_path, "w") as f:
            f.write(content)
        print("Patched framer.py")
    else:
        print("Failed to patch framer.py: target not found")

if __name__ == "__main__":
    patch_worker()
    patch_reader()
    patch_admin_overview()
    patch_framer()
