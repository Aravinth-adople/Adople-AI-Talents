import re
from typing import Dict, List, Any
from app.default_jds import get_jd_by_id, DEFAULT_JDS

def score_resume_against_jd(candidate: Dict[str, Any], jd: Dict[str, Any]) -> Dict[str, Any]:
    skills = candidate.get('skills', [])
    projects = candidate.get('projects', [])
    raw_text = candidate.get('raw_text', '').lower()
    primary_cat = candidate.get('primary_category', 'Other')
    secondary_cats = candidate.get('secondary_categories', [])
    
    # JD requirements
    key_skills = jd.get('key_skills', {})
    project_keywords = jd.get('project_keywords', [])
    preferred_categories = jd.get('preferred_categories', [])
    
    matched_skills = []
    missing_skills = []
    
    total_possible_skill_weight = 0.0
    earned_skill_weight = 0.0
    
    candidate_skills_lower = [s.lower() for s in skills]
    candidate_skills_str = " ".join(candidate_skills_lower)
    
    for req_skill, weight in key_skills.items():
        total_possible_skill_weight += weight
        
        # Check in extracted skills or raw text
        pat = r'\b' + re.escape(req_skill.lower()) + r'\b'
        in_skills = req_skill.lower() in candidate_skills_lower or any(req_skill.lower() in s for s in candidate_skills_lower)
        in_text = bool(re.search(pat, raw_text))
        
        if in_skills:
            earned_skill_weight += weight
            matched_skills.append(req_skill.title())
        elif in_text:
            earned_skill_weight += weight * 0.85
            matched_skills.append(req_skill.title())
        else:
            if weight >= 3.5:  # Only flag important skills as missing gaps
                missing_skills.append(req_skill.title())

    # 1. Skill Score (60% of total score)
    skill_ratio = (earned_skill_weight / total_possible_skill_weight) if total_possible_skill_weight > 0 else 0.0
    skill_component = min(1.0, skill_ratio * 1.25) * 60.0  # Normalized curve
    
    # 2. Project Alignment Score (25% of total score)
    proj_pieces = []
    for p in projects:
        if isinstance(p, dict):
            proj_pieces.append(f"{p.get('title', '')} {p.get('description', '')}")
        elif isinstance(p, str):
            proj_pieces.append(p)
    proj_text = " ".join(proj_pieces).lower()
    matched_proj_keywords = 0
    for pk in project_keywords:
        if pk.lower() in proj_text:
            matched_proj_keywords += 1
            
    proj_ratio = min(1.0, matched_proj_keywords / max(2, len(project_keywords) * 0.4))
    proj_component = proj_ratio * 25.0
    
    # 3. Category Match Bonus (15% of total score)
    category_component = 0.0
    if primary_cat in preferred_categories:
        category_component = 15.0
    elif any(sc in preferred_categories for sc in secondary_cats):
        category_component = 10.0
    elif primary_cat != 'Other':
        category_component = 5.0
        
    final_score = round(min(100.0, skill_component + proj_component + category_component), 1)
    
    # Fit Level definition
    if final_score >= 75.0:
        fit_level = "Strong Match"
        fit_badge_color = "#10b981" # Green
    elif final_score >= 60.0:
        fit_level = "Good Match"
        fit_badge_color = "#3b82f6" # Blue
    elif final_score >= 45.0:
        fit_level = "Moderate Match"
        fit_badge_color = "#f59e0b" # Amber
    else:
        fit_level = "Low Match"
        fit_badge_color = "#64748b" # Gray
        
    return {
        'jd_id': jd['id'],
        'jd_title': jd['title'],
        'score': final_score,
        'fit_level': fit_level,
        'fit_badge_color': fit_badge_color,
        'matched_skills': matched_skills[:15],
        'missing_skills': missing_skills[:8],
        'breakdown': {
            'skills_score': round(skill_component, 1),
            'projects_score': round(proj_component, 1),
            'category_score': round(category_component, 1)
        }
    }

def score_all_default_jds(candidate: Dict[str, Any]) -> Dict[str, float]:
    scores = {}
    for jd in DEFAULT_JDS:
        res = score_resume_against_jd(candidate, jd)
        scores[jd['id']] = res['score']
    return scores
