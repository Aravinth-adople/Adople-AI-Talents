import sqlite3
import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from app.default_jds import DEFAULT_JDS

DB_PATH = Path(__file__).parent / "resumes_app.db"

def get_connection():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        file_path TEXT,
        name TEXT,
        email TEXT,
        phone TEXT,
        github TEXT,
        linkedin TEXT,
        passout_year INTEGER,
        cgpa REAL,
        degree TEXT,
        primary_category TEXT,
        secondary_categories TEXT,
        skills TEXT,
        projects TEXT,
        raw_text TEXT,
        status TEXT DEFAULT 'unreviewed',
        score_ai_engineer REAL DEFAULT 0.0,
        score_full_stack_java REAL DEFAULT 0.0,
        score_ar_caller REAL DEFAULT 0.0,
        score_us_bd_sales REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS custom_jds (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        department TEXT,
        badge_color TEXT,
        preferred_categories TEXT,
        key_skills TEXT,
        project_keywords TEXT,
        raw_text TEXT,
        is_default INTEGER DEFAULT 0
    );
    """)

    # Indices for blazing fast filtering and sorting
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_candidates_passout ON candidates(passout_year);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_candidates_cgpa ON candidates(cgpa);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_candidates_category ON candidates(primary_category);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_candidates_score_ai ON candidates(score_ai_engineer);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_candidates_score_fs ON candidates(score_full_stack_java);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_candidates_score_ar ON candidates(score_ar_caller);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_candidates_score_bd ON candidates(score_us_bd_sales);")

    # Column migrations for Azure AI evaluation
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN ai_summary TEXT;")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN ai_evaluated INTEGER DEFAULT 0;")
    except sqlite3.OperationalError:
        pass


    # Insert default JDs if not already present
    for jd in DEFAULT_JDS:
        cursor.execute("""
        INSERT OR REPLACE INTO custom_jds (
            id, title, department, badge_color, preferred_categories,
            key_skills, project_keywords, raw_text, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            jd['id'],
            jd['title'],
            jd['department'],
            jd.get('badge_color', '#6366f1'),
            json.dumps(jd['preferred_categories']),
            json.dumps(jd['key_skills']),
            json.dumps(jd['project_keywords']),
            jd['raw_text']
        ))

    conn.commit()
    conn.close()

def upsert_candidate(c: Dict[str, Any]) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    
    sec_cats = json.dumps(c.get('secondary_categories', []))
    skills = json.dumps(c.get('skills', []))
    projects = json.dumps(c.get('projects', []))
    
    jd_scores = c.get('jd_scores', {})
    score_ai = jd_scores.get('ai-engineer', 0.0)
    score_fs = jd_scores.get('full-stack-java', 0.0)
    score_ar = jd_scores.get('ar-caller', 0.0)
    score_bd = jd_scores.get('us-bd-sales', 0.0)

    cursor.execute("""
    INSERT INTO candidates (
        filename, file_path, name, email, phone, github, linkedin,
        passout_year, cgpa, degree, primary_category, secondary_categories,
        skills, projects, raw_text, status,
        score_ai_engineer, score_full_stack_java, score_ar_caller, score_us_bd_sales,
        ai_summary, ai_evaluated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(filename) DO UPDATE SET
        file_path = excluded.file_path,
        name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        github = excluded.github,
        linkedin = excluded.linkedin,
        passout_year = excluded.passout_year,
        cgpa = excluded.cgpa,
        degree = excluded.degree,
        primary_category = excluded.primary_category,
        secondary_categories = excluded.secondary_categories,
        skills = excluded.skills,
        projects = excluded.projects,
        raw_text = excluded.raw_text,
        score_ai_engineer = excluded.score_ai_engineer,
        score_full_stack_java = excluded.score_full_stack_java,
        score_ar_caller = excluded.score_ar_caller,
        score_us_bd_sales = excluded.score_us_bd_sales,
        ai_summary = excluded.ai_summary,
        ai_evaluated = excluded.ai_evaluated
    """, (
        c['filename'],
        c.get('file_path', ''),
        c.get('name', 'Candidate'),
        c.get('email', ''),
        c.get('phone', ''),
        c.get('github', ''),
        c.get('linkedin', ''),
        c.get('passout_year', 2025),
        c.get('cgpa', 7.5),
        c.get('degree', "Bachelor's"),
        c.get('primary_category', 'Other'),
        sec_cats,
        skills,
        projects,
        c.get('raw_text', ''),
        c.get('status', 'unreviewed'),
        score_ai,
        score_fs,
        score_ar,
        score_bd,
        c.get('ai_summary', ''),
        c.get('ai_evaluated', 0)
    ))
    
    cand_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return cand_id

def bulk_upsert_candidates(candidates_list: List[Dict[str, Any]]) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("BEGIN TRANSACTION")
    count = 0
    for c in candidates_list:
        sec_cats = json.dumps(c.get('secondary_categories', []))
        skills = json.dumps(c.get('skills', []))
        projects = json.dumps(c.get('projects', []))
        jd_scores = c.get('jd_scores', {})
        score_ai = jd_scores.get('ai-engineer', 0.0)
        score_fs = jd_scores.get('full-stack-java', 0.0)
        score_ar = jd_scores.get('ar-caller', 0.0)
        score_bd = jd_scores.get('us-bd-sales', 0.0)

        cursor.execute("""
        INSERT INTO candidates (
            filename, file_path, name, email, phone, github, linkedin,
            passout_year, cgpa, degree, primary_category, secondary_categories,
            skills, projects, raw_text, status,
            score_ai_engineer, score_full_stack_java, score_ar_caller, score_us_bd_sales
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(filename) DO UPDATE SET
            file_path = excluded.file_path,
            name = excluded.name,
            email = excluded.email,
            phone = excluded.phone,
            github = excluded.github,
            linkedin = excluded.linkedin,
            passout_year = excluded.passout_year,
            cgpa = excluded.cgpa,
            degree = excluded.degree,
            primary_category = excluded.primary_category,
            secondary_categories = excluded.secondary_categories,
            skills = excluded.skills,
            projects = excluded.projects,
            raw_text = excluded.raw_text,
            score_ai_engineer = excluded.score_ai_engineer,
            score_full_stack_java = excluded.score_full_stack_java,
            score_ar_caller = excluded.score_ar_caller,
            score_us_bd_sales = excluded.score_us_bd_sales
        """, (
            c['filename'],
            c.get('file_path', ''),
            c.get('name', 'Candidate'),
            c.get('email', ''),
            c.get('phone', ''),
            c.get('github', ''),
            c.get('linkedin', ''),
            c.get('passout_year', 2025),
            c.get('cgpa', 7.5),
            c.get('degree', "Bachelor's"),
            c.get('primary_category', 'Other'),
            sec_cats,
            skills,
            projects,
            c.get('raw_text', ''),
            c.get('status', 'unreviewed'),
            score_ai,
            score_fs,
            score_ar,
            score_bd
        ))
        count += 1
        
    conn.commit()
    conn.close()
    return count

def get_candidates(
    search: str = "",
    category: str = "",
    passout_year: Optional[int] = None,
    min_cgpa: Optional[float] = None,
    min_score: Optional[float] = None,
    status: str = "",
    active_jd_id: str = "ai-engineer",
    sort_by: str = "score", # score, cgpa, passout_year, name
    sort_order: str = "desc", # asc, desc
    page: int = 1,
    page_size: int = 25
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    score_col = "score_ai_engineer"
    if active_jd_id == "full-stack-java":
        score_col = "score_full_stack_java"
    elif active_jd_id == "ar-caller":
        score_col = "score_ar_caller"
    elif active_jd_id == "us-bd-sales":
        score_col = "score_us_bd_sales"

    query_parts = ["1=1"]
    params = []

    if search:
        search_terms = f"%{search.strip()}%"
        query_parts.append("""(
            name LIKE ? OR 
            email LIKE ? OR 
            skills LIKE ? OR 
            projects LIKE ? OR 
            filename LIKE ?
        )""")
        params.extend([search_terms, search_terms, search_terms, search_terms, search_terms])

    if category and category != "All":
        query_parts.append("(primary_category = ? OR secondary_categories LIKE ?)")
        params.extend([category, f"%{category}%"])

    if passout_year and passout_year > 0:
        if passout_year == 2022: # represents 2022 and older
            query_parts.append("passout_year <= 2022")
        else:
            query_parts.append("passout_year = ?")
            params.append(passout_year)

    if min_cgpa and min_cgpa > 0:
        query_parts.append("cgpa >= ?")
        params.append(min_cgpa)

    if min_score and min_score > 0:
        query_parts.append(f"{score_col} >= ?")
        params.append(min_score)

    if status and status != "All":
        query_parts.append("status = ?")
        params.append(status.lower())

    where_clause = " AND ".join(query_parts)

    # Count total matching candidates
    cursor.execute(f"SELECT COUNT(*) FROM candidates WHERE {where_clause}", params)
    total_count = cursor.fetchone()[0]

    # Sorting
    sort_column = score_col
    if sort_by == "cgpa":
        sort_column = "cgpa"
    elif sort_by == "passout_year":
        sort_column = "passout_year"
    elif sort_by == "name":
        sort_column = "name"

    order_dir = "DESC" if sort_order.lower() == "desc" else "ASC"
    
    offset = (page - 1) * page_size
    
    query = f"""
    SELECT 
        id, filename, file_path, name, email, phone, github, linkedin,
        passout_year, cgpa, degree, primary_category, secondary_categories,
        skills, projects, status, {score_col} as active_score,
        score_ai_engineer, score_full_stack_java, score_ar_caller, score_us_bd_sales,
        ai_summary, ai_evaluated,
        created_at
    FROM candidates 
    WHERE {where_clause}
    ORDER BY {sort_column} {order_dir}, id ASC
    LIMIT ? OFFSET ?
    """
    params.extend([page_size, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    results = []
    for r in rows:
        c_dict = dict(r)
        c_dict['secondary_categories'] = json.loads(c_dict['secondary_categories'] or '[]')
        c_dict['skills'] = json.loads(c_dict['skills'] or '[]')
        c_dict['projects'] = json.loads(c_dict['projects'] or '[]')
        results.append(c_dict)

    conn.close()
    
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return {
        'candidates': results,
        'total_count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': total_pages
    }

def get_candidate_by_id(candidate_id: int, active_jd_id: str = "ai-engineer") -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    c = dict(row)
    c['secondary_categories'] = json.loads(c['secondary_categories'] or '[]')
    c['skills'] = json.loads(c['skills'] or '[]')
    c['projects'] = json.loads(c['projects'] or '[]')
    
    score_col = f"score_{active_jd_id.replace('-', '_')}"
    if score_col in c and c[score_col] is not None:
        c['active_score'] = float(c[score_col])
    elif 'score_ai_engineer' in c and c['score_ai_engineer'] is not None:
        c['active_score'] = float(c['score_ai_engineer'])
    else:
        c['active_score'] = 0.0
        
    return c

def update_candidate_status(candidate_id: int, status: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE candidates SET status = ? WHERE id = ?", (status.lower(), candidate_id))
    conn.commit()
    conn.close()
    return True

def update_candidate_ai_evaluation(candidate_id: int, ai_data: Dict[str, Any]) -> bool:
    """Updates candidate profile with Azure OpenAI (gpt-6-luna) classification and scoring."""
    conn = get_connection()
    cursor = conn.cursor()
    
    name = ai_data.get("name")
    email = ai_data.get("email")
    phone = ai_data.get("phone")
    passout_year = ai_data.get("passout_year")
    cgpa = ai_data.get("cgpa")
    degree = ai_data.get("degree")
    primary_category = ai_data.get("primary_category")
    sec_cats = json.dumps(ai_data.get("secondary_categories", []))
    skills = json.dumps(ai_data.get("skills", []))
    projects = json.dumps(ai_data.get("projects", []))
    ai_summary = ai_data.get("ai_summary", "")
    
    scores = ai_data.get("scores", {})
    score_ai = float(scores["ai-engineer"]) if "ai-engineer" in scores and scores["ai-engineer"] is not None else None
    score_fs = float(scores["full-stack-java"]) if "full-stack-java" in scores and scores["full-stack-java"] is not None else None
    score_ar = float(scores["ar-caller"]) if "ar-caller" in scores and scores["ar-caller"] is not None else None
    score_bd = float(scores["us-bd-sales"]) if "us-bd-sales" in scores and scores["us-bd-sales"] is not None else None
    
    cursor.execute("""
        UPDATE candidates SET
            name = COALESCE(?, name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            passout_year = COALESCE(?, passout_year),
            cgpa = COALESCE(?, cgpa),
            degree = COALESCE(?, degree),
            primary_category = COALESCE(?, primary_category),
            secondary_categories = ?,
            skills = ?,
            projects = ?,
            ai_summary = ?,
            ai_evaluated = 1,
            score_ai_engineer = COALESCE(?, score_ai_engineer),
            score_full_stack_java = COALESCE(?, score_full_stack_java),
            score_ar_caller = COALESCE(?, score_ar_caller),
            score_us_bd_sales = COALESCE(?, score_us_bd_sales)
        WHERE id = ?
    """, (
        name, email, phone, passout_year, cgpa, degree, primary_category,
        sec_cats, skills, projects, ai_summary,
        score_ai, score_fs, score_ar, score_bd,
        candidate_id
    ))
    conn.commit()
    conn.close()
    return True


def delete_candidate(candidate_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path FROM candidates WHERE id = ?", (candidate_id,))
    row = cursor.fetchone()
    if row and row['file_path']:
        try:
            fp = Path(row['file_path'])
            if fp.exists() and "uploads" in str(fp):
                fp.unlink(missing_ok=True)
        except Exception:
            pass
    cursor.execute("DELETE FROM candidates WHERE id = ?", (candidate_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def get_statistics(active_jd_id: str = "ai-engineer") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    score_col = "score_ai_engineer"
    if active_jd_id == "full-stack-java":
        score_col = "score_full_stack_java"
    elif active_jd_id == "ar-caller":
        score_col = "score_ar_caller"
    elif active_jd_id == "us-bd-sales":
        score_col = "score_us_bd_sales"

    cursor.execute("SELECT COUNT(*) FROM candidates")
    total_resumes = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM candidates WHERE status = 'shortlisted'")
    shortlisted_count = cursor.fetchone()[0]

    cursor.execute(f"SELECT AVG({score_col}) FROM candidates")
    avg_score = round(cursor.fetchone()[0] or 0.0, 1)

    cursor.execute(f"SELECT COUNT(*) FROM candidates WHERE {score_col} >= 70.0")
    top_matches = cursor.fetchone()[0]

    # Category counts
    cursor.execute("""
    SELECT primary_category, COUNT(*) as count 
    FROM candidates 
    GROUP BY primary_category 
    ORDER BY count DESC
    """)
    category_counts = {r['primary_category']: r['count'] for r in cursor.fetchall()}

    # Passout year counts
    cursor.execute("""
    SELECT passout_year, COUNT(*) as count 
    FROM candidates 
    GROUP BY passout_year 
    ORDER BY passout_year DESC
    """)
    passout_year_counts = {r['passout_year']: r['count'] for r in cursor.fetchall()}

    conn.close()
    return {
        'total_resumes': total_resumes,
        'shortlisted_count': shortlisted_count,
        'avg_score': avg_score,
        'top_matches': top_matches,
        'category_counts': category_counts,
        'passout_year_counts': passout_year_counts
    }
