import sys
file_path = "/Users/emekaabraham/Downloads/tracenews-api/app/worker.py"
with open(file_path, "r") as f:
    content = f.read()

target = """        # 7. Update public one-tier feed (Cache for Reader Summary & Admin Overview)
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
            logger.error(f"[worker] Feed caching failed: {e}")"""

replacement = """        # 7. Update public one-tier feed (Cache for Reader Summary & Admin Overview)
        logger.info("[worker] === PUBLIC FEED CACHING ===")
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
        logger.info("[worker] Public feeds cached.")"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w") as f:
        f.write(content)
    print("Patched worker.py")
else:
    print("Target not found")
