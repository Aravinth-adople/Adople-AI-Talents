import os
import json
import time
import hashlib
from pathlib import Path
import pandas as pd
from app.database import init_db, bulk_upsert_candidates, get_statistics
from app.parser import parse_resume
from app.classifier import classify_resume
from app.scorer import score_all_default_jds

def sync_cleaned_resumes(limit: int = None):
    print("Initializing Database...")
    init_db()

    cleaned_dir = Path("cleaned_resumes")
    manifest_csv = cleaned_dir / "cleaned_resumes_manifest.csv"
    cache_json = cleaned_dir / ".cache" / "extraction_cache.json"

    if not cache_json.exists():
        print("Extraction cache not found!")
        return 0

    print("Loading extraction cache...")
    t0 = time.time()
    with open(cache_json, "r", encoding="utf-8") as f:
        cache_data = json.load(f)
    print(f"Loaded {len(cache_data)} cache entries in {time.time()-t0:.2f}s")

    # Get list of files in cleaned_resumes
    files = [f for f in cleaned_dir.iterdir() if f.is_file() and not f.name.endswith(".csv")]
    if limit:
        files = files[:limit]

    print(f"Syncing {len(files)} cleaned resumes into SQLite database...")
    
    candidates_batch = []
    batch_size = 250
    total_synced = 0
    t_start = time.time()

    for i, file_path in enumerate(files):
        filename = file_path.name
        # Compute md5 to retrieve text from cache
        try:
            with open(file_path, "rb") as fp:
                file_hash = hashlib.md5(fp.read()).hexdigest()
        except Exception:
            continue

        cached_entry = cache_data.get(file_hash)
        if cached_entry:
            raw_text = cached_entry.get("text", "")
        else:
            raw_text = ""

        # Parse candidate
        parsed = parse_resume(filename, raw_text)
        parsed["file_path"] = str(file_path.resolve())

        # Classify
        classification = classify_resume(parsed["skills"], parsed["projects"], parsed["raw_text"])
        parsed["primary_category"] = classification["primary_category"]
        parsed["secondary_categories"] = classification["secondary_categories"]

        # Score against all 4 default JDs
        jd_scores = score_all_default_jds(parsed)
        parsed["jd_scores"] = jd_scores

        candidates_batch.append(parsed)

        if len(candidates_batch) >= batch_size:
            bulk_upsert_candidates(candidates_batch)
            total_synced += len(candidates_batch)
            candidates_batch = []
            print(f"Progress: {total_synced}/{len(files)} resumes synced ({time.time()-t_start:.1f}s)")

    if candidates_batch:
        bulk_upsert_candidates(candidates_batch)
        total_synced += len(candidates_batch)

    print(f"Done! Successfully synced {total_synced} resumes into database in {time.time()-t_start:.2f}s")
    stats = get_statistics()
    print("Database Stats:", stats)
    return total_synced

if __name__ == "__main__":
    sync_cleaned_resumes()
