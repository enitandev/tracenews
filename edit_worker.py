import sys
file_path = "/Users/emekaabraham/Downloads/tracenews-api/app/worker.py"
with open(file_path, "r") as f:
    content = f.read()

target = """        # 5. Framing (bounded to 20 clusters, skips already-cached)
        from app.framer import run_framing_job
        logger.info("[worker] === FRAMING ===")
        run_framing_job()
        logger.info("[worker] Framing done.")"""

replacement = """        # 5. Framing (bounded to 20 clusters, skips already-cached)
        # Disabled 4 Sep 2026 — output suppressed on the frontend since Bridge Chambers ruling 9 Jul 2026. Do not re-enable without counsel clearance.
        # from app.framer import run_framing_job
        logger.info("[worker] === FRAMING (DISABLED) ===")
        # run_framing_job()
        logger.info("[worker] Framing disabled.")"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w") as f:
        f.write(content)
    print("Successfully updated worker.py")
else:
    print("Target text not found in worker.py")
