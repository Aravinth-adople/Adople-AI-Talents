import os
import json
import re
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "https://alex-7329-resource.cognitiveservices.azure.com").rstrip("/")
AZURE_API_KEY = os.getenv("AZURE_OPENAI_KEY", "4gCH0BEDSfbdmScPuGwbxPqi0xudKXUyl5VdnUskUPKyag1sv4RaJQQJ99CIACHYHv6XJ3w3AAAAACOG8T3L")
AZURE_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-6-luna")
API_VERSION = "2024-02-15-preview"

# Valid Categories
CATEGORIES = [
    "Full Stack",
    "Agentic AI",
    "AI/ML",
    "Frontend",
    "Backend",
    "Data Analyst",
    "Business Development",
    "AR Calling",
    "QA/Testing",
    "DevOps",
    "UI/UX",
    "Other"
]

def clean_json_response(text: str) -> str:
    """Extract and clean JSON from model response text."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def analyze_resume_with_ai(raw_text: str, filename: str = "", active_jd_id: str = "ai-engineer") -> Dict[str, Any]:
    """
    Calls Azure OpenAI (gpt-6-luna) to deeply analyze, classify, and score a resume.
    Returns structured data matching the candidate schema.
    """
    deployment_id = AZURE_DEPLOYMENT
    # Auto-alias gpt-luna-6 to gpt-6-luna
    if deployment_id == "gpt-luna-6":
        deployment_id = "gpt-6-luna"

    url = f"{AZURE_ENDPOINT}/openai/deployments/{deployment_id}/chat/completions?api-version={API_VERSION}"
    
    # Trim text to prevent token overflow if resume is very large
    truncated_text = raw_text[:7500]

    system_instruction = (
        "You are an enterprise AI recruitment intelligence system. "
        "Analyze the given resume text thoroughly. "
        "Read the resume content, automatically detect what domain/type of candidate this is, "
        "and calculate accurate fit scores (0-100) for the specified roles.\n\n"
        "Categories must strictly be chosen from:\n"
        "- Full Stack\n"
        "- Agentic AI\n"
        "- AI/ML\n"
        "- Frontend\n"
        "- Backend\n"
        "- Data Analyst\n"
        "- Business Development\n"
        "- AR Calling\n"
        "- QA/Testing\n"
        "- DevOps\n"
        "- UI/UX\n"
        "- Other\n\n"
        "Return ONLY a valid JSON object matching this schema:\n"
        "{\n"
        '  "name": "Candidate Full Name",\n'
        '  "email": "email or null",\n'
        '  "phone": "phone or null",\n'
        '  "passout_year": 2027,\n'
        '  "cgpa": 8.5, // Extract ONLY college/university CGPA or college percentage (out of 10 scale, e.g. 85% -> 8.5). Strictly DO NOT extract 10th/12th school marks or project percentages. Return null if college CGPA is not given.\n'
        '  "degree": "B.Tech Computer Science",\n'
        '  "primary_category": "One category from the list above",\n'
        '  "secondary_categories": ["Category 2", "Category 3"],\n'
        '  "skills": ["Skill1", "Skill2", "Skill3", ...],\n'
        '  "projects": ["Project title/summary 1", "Project title/summary 2", ...],\n'
        '  "experience_years": 0.5,\n'
        '  "ai_summary": "1-2 sentence executive summary of candidate suitability and key strengths",\n'
        '  "scores": {\n'
        '    "ai-engineer": 92,\n'
        '    "full-stack-java": 45,\n'
        '    "ar-caller": 15,\n'
        '    "us-bd-sales": 10\n'
        "  },\n"
        '  "matched_skills": ["List of skills matching active role"],\n'
        '  "missing_skills": ["List of skills missing or recommended for growth"]\n'
        "}"
    )

    user_prompt = f"Resume Filename: {filename}\nActive Target Evaluation Role: {active_jd_id}\n\nResume Content:\n{truncated_text}"

    # Note: gpt-6-luna requires omitting temperature or using default (1)
    payload = json.dumps({
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt}
        ]
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "api-key": AZURE_API_KEY
    }

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=35) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            cleaned = clean_json_response(content)
            result = json.loads(cleaned)
            # Ensure CGPA is strictly on a 10.0 scale and numeric
            if "cgpa" in result and result["cgpa"] is not None:
                try:
                    c_val = float(result["cgpa"])
                    if 10.0 < c_val <= 100.0:
                        result["cgpa"] = round(c_val / 10.0, 2)
                    elif 0.0 < c_val <= 10.0:
                        result["cgpa"] = round(c_val, 2)
                    else:
                        result["cgpa"] = None
                except (ValueError, TypeError):
                    result["cgpa"] = None
            else:
                result["cgpa"] = None

            result["ai_evaluated"] = True
            result["ai_model"] = "gpt-6-luna (Azure OpenAI)"
            return result
    except Exception as e:
        print(f"[Azure AI Error] {e}")
        # Return fallback flag indicating error
        return {
            "ai_evaluated": False,
            "error": str(e)
        }
