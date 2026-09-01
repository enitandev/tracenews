import re

file_path = "/Users/emekaabraham/Downloads/tracenews-api/app/routers/reader.py"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
"""class TrackReadRequest(BaseModel):
    tier: str""",
"""class TrackReadRequest(BaseModel):
    tier: str
    verdict: str = None"""
)

content = content.replace(
"""        if counter_res.data:
            current = counter_res.data[0]
            new_count = current.get(counter_column, 0) + 1
            payload = {
                counter_column: new_count,
                "updated_at": now_iso
            }
            supabase.table("reader_tier_counters").update(payload).eq("user_id", user_id).execute()
        else:
            payload = {
                "user_id": user_id,
                "govt_count": 0,
                "mainstream_count": 0,
                "watchdog_count": 0,
                counter_column: 1,
                "updated_at": now_iso
            }""",
"""        if counter_res.data:
            current = counter_res.data[0]
            new_count = current.get(counter_column, 0) + 1
            payload = {
                counter_column: new_count,
                "updated_at": now_iso
            }
            if request.verdict == "clear":
                payload["broad_count"] = current.get("broad_count", 0) + 1
            elif request.verdict == "mixed":
                payload["partial_count"] = current.get("partial_count", 0) + 1

            supabase.table("reader_tier_counters").update(payload).eq("user_id", user_id).execute()
        else:
            payload = {
                "user_id": user_id,
                "govt_count": 0,
                "mainstream_count": 0,
                "watchdog_count": 0,
                "broad_count": 0,
                "partial_count": 0,
                counter_column: 1,
                "updated_at": now_iso
            }
            if request.verdict == "clear":
                payload["broad_count"] = 1
            elif request.verdict == "mixed":
                payload["partial_count"] = 1"""
)

content = content.replace(
"""        res = supabase.table("reader_tier_counters") \\
            .select("govt_count, mainstream_count, watchdog_count") \\
            .eq("user_id", user_id) \\
            .limit(1) \\
            .execute()
            
        if res.data:
            counts = res.data[0]
            return {
                "govt": counts.get("govt_count", 0),
                "mainstream": counts.get("mainstream_count", 0),
                "watchdog": counts.get("watchdog_count", 0)
            }
        else:
            return {
                "govt": 0,
                "mainstream": 0,
                "watchdog": 0
            }""",
"""        res = supabase.table("reader_tier_counters") \\
            .select("govt_count, mainstream_count, watchdog_count, broad_count, partial_count") \\
            .eq("user_id", user_id) \\
            .limit(1) \\
            .execute()
            
        if res.data:
            counts = res.data[0]
            return {
                "govt": counts.get("govt_count", 0),
                "mainstream": counts.get("mainstream_count", 0),
                "watchdog": counts.get("watchdog_count", 0),
                "broad": counts.get("broad_count", 0),
                "partial": counts.get("partial_count", 0)
            }
        else:
            return {
                "govt": 0,
                "mainstream": 0,
                "watchdog": 0,
                "broad": 0,
                "partial": 0
            }"""
)

with open(file_path, "w") as f:
    f.write(content)

