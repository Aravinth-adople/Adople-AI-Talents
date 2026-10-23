import time
import threading
import json
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional
from app.database import get_connection, update_candidate_ai_evaluation
from app.azure_ai import analyze_resume_with_ai
from app.parser import extract_text_from_file

class BatchEvaluator:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.is_running = False
        self.should_stop = False
        self.total_candidates = 0
        self.evaluated_count = 0
        self.success_count = 0
        self.error_count = 0
        self.current_candidate_name = ""
        self.start_time = 0
        self.elapsed_seconds = 0
        self.worker_thread = None
        self.db_lock = threading.Lock()

    @classmethod
    def get_instance(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = BatchEvaluator()
            return cls._instance

    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*), SUM(CASE WHEN ai_evaluated = 1 THEN 1 ELSE 0 END) FROM candidates")
            total_db, evaluated_db = cursor.fetchone()
            conn.close()

            evaluated_db = evaluated_db or 0
            pct = round((evaluated_db / total_db * 100), 1) if total_db > 0 else 0.0
            elapsed = time.time() - self.start_time if self.is_running and self.start_time > 0 else self.elapsed_seconds

            return {
                "is_running": self.is_running,
                "total_candidates": total_db,
                "evaluated_count": evaluated_db,
                "percent_complete": pct,
                "success_count": self.success_count,
                "error_count": self.error_count,
                "current_candidate": self.current_candidate_name,
                "elapsed_seconds": round(elapsed, 1),
                "speed_per_minute": round((self.success_count / (elapsed / 60)), 1) if elapsed > 10 and self.success_count > 0 else 0.0
            }

    def start(self, active_jd_id: str = "ai-engineer", reevaluate_all: bool = False, max_workers: int = 6):
        with self._lock:
            if self.is_running:
                return {"status": "already_running", "message": "Batch evaluation is already running."}
            self.is_running = True
            self.should_stop = False
            self.start_time = time.time()
            self.success_count = 0
            self.error_count = 0

            self.worker_thread = threading.Thread(
                target=self._run_batch,
                args=(active_jd_id, reevaluate_all, max_workers),
                daemon=True
            )
            self.worker_thread.start()
            return {"status": "started", "message": "Batch AI evaluation started."}

    def stop(self):
        with self._lock:
            if not self.is_running:
                return {"status": "not_running", "message": "Batch evaluation is not running."}
            self.should_stop = True
            return {"status": "stopping", "message": "Stopping batch AI evaluation..."}

    def _run_batch(self, active_jd_id: str, reevaluate_all: bool, max_workers: int):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            if reevaluate_all:
                cursor.execute("SELECT id, filename, file_path, raw_text FROM candidates ORDER BY id ASC")
            else:
                cursor.execute("SELECT id, filename, file_path, raw_text FROM candidates WHERE ai_evaluated = 0 ORDER BY id ASC")
            candidates_to_eval = cursor.fetchall()
            conn.close()

            self.total_candidates = len(candidates_to_eval)
            print(f"[BatchEvaluator] Starting AI evaluation of {self.total_candidates} candidates with {max_workers} workers...")

            def process_candidate(row):
                if self.should_stop:
                    return False
                cid = row["id"]
                fn = row["filename"]
                text = row["raw_text"] or ""
                fp = row["file_path"] if "file_path" in row.keys() else ""

                if not text.strip() and fp and os.path.exists(fp):
                    try:
                        text = extract_text_from_file(fp)
                    except Exception:
                        pass

                self.current_candidate_name = fn

                # Try evaluating with Azure OpenAI (with 1 retry on 429)
                for attempt in range(2):
                    if self.should_stop:
                        return False
                    try:
                        res = analyze_resume_with_ai(text, filename=fn, active_jd_id=active_jd_id)
                        if res.get("ai_evaluated"):
                            with self.db_lock:
                                update_candidate_ai_evaluation(cid, res)
                            self.success_count += 1
                            return True
                        elif "429" in str(res.get("error", "")):
                            time.sleep(3.0 * (attempt + 1))
                            continue
                    except Exception as e:
                        if attempt == 1:
                            print(f"[BatchEvaluator] Error on candidate {cid} ({fn}): {e}")
                self.error_count += 1
                return False

            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                for _ in executor.map(process_candidate, candidates_to_eval):
                    if self.should_stop:
                        print("[BatchEvaluator] Stopping worker threads upon user request.")
                        break

        except Exception as e:
            print(f"[BatchEvaluator] Critical error in batch evaluator: {e}")
        finally:
            with self._lock:
                self.is_running = False
                self.elapsed_seconds = time.time() - self.start_time
                self.current_candidate_name = ""
            print(f"[BatchEvaluator] Finished. Success: {self.success_count}, Errors: {self.error_count}")

