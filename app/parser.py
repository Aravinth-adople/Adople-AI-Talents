import re
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

try:
    import pymupdf  # PyMuPDF
except ImportError:
    pymupdf = None

try:
    import docx
except ImportError:
    docx = None

# Comprehensive Skills Taxonomy
SKILLS_TAXONOMY = {
    'Agentic AI': [
        'agentic ai', 'agentic', 'langgraph', 'crewai', 'autogen', 'mcp', 'model context protocol',
        'tool calling', 'function calling', 'llamaindex', 'langchain', 'rag', 'retrieval augmented generation',
        'multi-agent', 'semantic kernel', 'agent framework', 'autonomous agent', 'vector database', 'chromadb', 'pinecone'
    ],
    'AI/ML': [
        'python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn',
        'keras', 'opencv', 'computer vision', 'nlp', 'natural language processing', 'transformers',
        'huggingface', 'cnn', 'rnn', 'lstm', 'pandas', 'numpy', 'scipy', 'generative ai', 'genai',
        'large language model', 'llm', 'llms', 'prompt engineering', 'xgboost', 'random forest', 'bert', 'gpt'
    ],
    'Frontend': [
        'react', 'react.js', 'reactjs', 'angular', 'angularjs', 'vue', 'vue.js', 'vuejs', 'next.js', 'nextjs',
        'html', 'html5', 'css', 'css3', 'javascript', 'typescript', 'tailwind', 'tailwindcss', 'bootstrap',
        'redux', 'sass', 'scss', 'webpack', 'vite', 'responsive design', 'material ui', 'mui', 'chakra ui', 'svelte'
    ],
    'Backend': [
        'python', 'java', 'node.js', 'nodejs', 'express', 'express.js', 'django', 'fastapi', 'flask',
        'spring', 'spring boot', 'golang', 'go', 'c#', '.net', 'asp.net', 'php', 'laravel', 'c++',
        'rest api', 'restful api', 'rest', 'graphql', 'microservices', 'grpc', 'websocket', 'socket.io', 'hibernate'
    ],
    'Full Stack': [
        'full stack', 'fullstack', 'mern', 'mean', 'pern', 'lamp stack'
    ],
    'Data Analyst': [
        'data analysis', 'data analyst', 'power bi', 'powerbi', 'tableau', 'excel', 'advanced excel',
        'vlookup', 'pivot table', 'statistics', 'eda', 'exploratory data analysis', 'seaborn', 'matplotlib',
        'sql query', 'bigquery', 'business intelligence', 'data visualization', 'dashboards', 'looker'
    ],
    'Business Development': [
        'business development', 'b2b sales', 'b2b', 'lead generation', 'cold calling', 'client outreach',
        'salesforce', 'hubspot', 'crm', 'client acquisition', 'prospecting', 'linkedin outreach',
        'deal closure', 'sales pipeline', 'negotiation', 'enterprise sales', 'revenue generation',
        'inside sales', 'outbound sales', 'account management', 'market research'
    ],
    'AR Calling': [
        'ar calling', 'ar caller', 'accounts receivable', 'denial management', 'revenue cycle management',
        'rcm', 'claim follow-up', 'payer follow-up', 'us healthcare', 'hipaa', 'appointment setting',
        'patient billing', 'medical billing', 'insurance verification', 'calling'
    ],
    'QA/Testing': [
        'manual testing', 'automation testing', 'selenium', 'cypress', 'junit', 'testng', 'postman',
        'jira', 'bug tracking', 'api testing', 'test cases', 'quality assurance', 'test execution',
        'regression testing', 'functional testing', 'cucumber', 'playwright'
    ],
    'DevOps': [
        'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s',
        'ci/cd', 'github actions', 'jenkins', 'git', 'github', 'gitlab', 'linux', 'terraform', 'ansible',
        'nginx', 'cloud computing', 'devops', 'helm'
    ],
    'UI/UX': [
        'ui/ux', 'ui design', 'ux design', 'figma', 'adobe xd', 'wireframing', 'prototyping',
        'user research', 'design systems', 'user interface', 'user experience', 'canva', 'interaction design'
    ]
}

_rapid_ocr_engine = None

def get_ocr_engine():
    global _rapid_ocr_engine
    if _rapid_ocr_engine is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            _rapid_ocr_engine = RapidOCR()
        except Exception:
            _rapid_ocr_engine = False
    return _rapid_ocr_engine if _rapid_ocr_engine is not False else None

def extract_text_from_file(file_path: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()
    
    if suffix == '.pdf':
        if pymupdf:
            try:
                doc = pymupdf.open(file_path)
                text = ""
                for page in doc:
                    text += page.get_text() + "\n"
                if len(text.strip()) > 30:
                    return text
                
                # Scanned PDF fallback via OCR
                ocr = get_ocr_engine()
                if ocr:
                    ocr_text_parts = []
                    for page_idx in range(min(3, len(doc))):
                        page = doc[page_idx]
                        pix = page.get_pixmap(dpi=150)
                        img_bytes = pix.tobytes("png")
                        result, _ = ocr(img_bytes)
                        if result:
                            ocr_text_parts.append("\n".join([line[1] for line in result]))
                    if ocr_text_parts:
                        return "\n".join(ocr_text_parts)
            except Exception:
                pass
    elif suffix in ['.png', '.jpg', '.jpeg']:
        ocr = get_ocr_engine()
        if ocr:
            try:
                result, _ = ocr(file_path)
                if result:
                    return "\n".join([line[1] for line in result])
            except Exception:
                pass
    elif suffix in ['.docx', '.doc']:
        if docx:
            try:
                doc = docx.Document(file_path)
                parts = []
                for p in doc.paragraphs:
                    if p.text:
                        parts.append(p.text)
                for table in doc.tables:
                    for row in table.rows:
                        row_text = " | ".join([c.text.strip() for c in row.cells if c.text.strip()])
                        if row_text:
                            parts.append(row_text)
                return "\n".join(parts)
            except Exception:
                pass
    elif suffix in ['.txt', '.md']:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception:
            pass

    return ""

def clean_extracted_text(text: str) -> str:
    # Normalize whitespaces while keeping linebreaks
    lines = [line.strip() for line in text.splitlines()]
    clean = "\n".join([l for l in lines if l])
    return clean

def extract_candidate_name(filename: str, text: str) -> str:
    # 1. Clean filename
    fn = Path(filename).stem
    
    # Check Row_XXXX_First_Last pattern
    m = re.match(r'Row_\d+_([A-Za-z]+_[A-Za-z]+)', fn)
    if m:
        return m.group(1).replace('_', ' ').strip().title()
        
    # Check (Name) - Name pattern
    m_paren = re.match(r'\(([^)]+)\)\s*-\s*(.+)', fn)
    if m_paren:
        return m_paren.group(1).replace('_', ' ').strip().title()
        
    # Check Name - Name pattern
    if ' - ' in fn:
        parts = fn.split(' - ')
        candidate = parts[-1].strip()
        candidate = re.sub(r'\.(pdf|docx|png|jpg|jpeg)$', '', candidate, flags=re.I)
        if len(candidate) > 2 and not any(w in candidate.lower() for w in ['resume', 'cv', 'final', 'update']):
            return candidate.replace('_', ' ').title()

    # Check clean name in filename
    clean_fn = re.sub(r'^(Row_\d+_|IMG[-_]|DOC[-_]|CV[-_])', '', fn, flags=re.I)
    clean_fn = re.sub(r'[-_](resume|cv|updated|final|new|format|ats).*$', '', clean_fn, flags=re.I)
    words = [w for w in re.split(r'[-_\s]+', clean_fn) if w and not w.isdigit()]
    if 1 <= len(words) <= 3 and all(w.isalpha() for w in words):
        return " ".join(words).title()

    # Fallback: check first 5 lines of text
    lines = [l.strip() for l in text.split('\n') if l.strip()][:5]
    for line in lines:
        # Ignore common headings
        if any(h in line.lower() for h in ['resume', 'curriculum', 'contact', 'email', 'phone', 'portfolio', 'github', 'page']):
            continue
        cleaned_line = re.sub(r'[^A-Za-z\s\.]', '', line).strip()
        name_words = cleaned_line.split()
        if 1 <= len(name_words) <= 4 and all(len(w) >= 2 for w in name_words):
            return cleaned_line.title()

    return "Candidate"

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    # Email
    email = None
    email_m = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', text)
    if email_m:
        email = email_m.group(0).lower()

    # Phone (Indian 10-digit, with optional +91 or 0 prefix)
    phone = None
    phone_m = re.search(r'(?:(?:\+91|91|0)[\s-]?)?([6-9]\d{4}[\s-]?\d{5})\b', text)
    if phone_m:
        phone = re.sub(r'\D', '', phone_m.group(0))
        if len(phone) > 10:
            phone = phone[-10:]
            
    # GitHub / LinkedIn
    github = None
    linkedin = None
    gh_m = re.search(r'(?:github\.com/)([A-Za-z0-9_-]+)', text, flags=re.I)
    if gh_m:
        github = f"https://github.com/{gh_m.group(1)}"
    li_m = re.search(r'(?:linkedin\.com/in/)([A-Za-z0-9_-]+)', text, flags=re.I)
    if li_m:
        linkedin = f"https://linkedin.com/in/{li_m.group(1)}"

    return {
        'email': email or 'Not Found',
        'phone': phone or 'Not Found',
        'github': github,
        'linkedin': linkedin
    }

def extract_education(text: str) -> Dict[str, Any]:
    clean = text.lower()
    
    # 1. Passout / Graduation Year
    # Supports explicit 2027 graduation year, up to 2030, down to 2018
    passout_year = None
    
    # Prioritized graduation year regex patterns
    year_patterns = [
        # Batch range e.g. "2023 - 2027", "2023-2027", "2022 to 2026"
        r'(?:201[5-9]|202[0-9])\s*[-–to/]+\s*(202[4-9]|2030)\b',
        # Explicit passing keywords e.g. "Year of Passing: 2027", "Batch: 2023-2027", "Expected: 2027"
        r'(?:passing|passout|graduation|completion|batch|expected)[\s:]*(?:year)?[\s:]*(202[0-9]|2030)\b',
        # Education line context e.g. "B.E CSE ... 2027", "2027 passout"
        r'\b(?:be|b\.e|btech|b\.tech|bsc|b\.sc|bca|mca|me|m\.e|mtech|m\.tech|bcom|b\.com)[\s\S]{0,80}?\b(202[0-9]|2030)\b',
        r'\b(2027|2026|2025|2024)\s*(?:batch|passout|graduate)?\b',
        r'\b(202[4-9]|2030)\b'
    ]
    
    for pat in year_patterns:
        m = re.search(pat, clean)
        if m:
            passout_year = int(m.group(1))
            break
            
    if not passout_year:
        all_years = [int(y) for y in re.findall(r'\b(201[8-9]|202[0-9]|2030)\b', clean)]
        if all_years:
            passout_year = max(all_years)
            
    if not passout_year:
        passout_year = 2025 # Default reasonable median for freshers

    # 2. CGPA / Percentage
    cgpa = None
    
    cgpa_patterns = [
        r'(?:cgpa|gpa|score|grade)(?:[\s:\-]+|(?:[\s]+of[\s]+))([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*(?:/10|/100|%|\b)',
        r'\b([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*(?:cgpa|gpa|/10\b)',
        r'(?:percentage|aggregate|marks)[\s:\-]*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%',
        r'\b([4-9][0-9](?:\.[0-9]{1,2})?)\s*%'
    ]
    for pat in cgpa_patterns:
        m = re.search(pat, clean)
        if m:
            try:
                val = float(m.group(1))
                if 10.0 < val <= 100.0:
                    # Convert percentage (e.g. 89% -> 8.9, 81.2% -> 8.12) to out of 10
                    cgpa = round(val / 10.0, 2)
                    break
                elif 0.0 < val <= 10.0:
                    cgpa = round(val, 2)
                    break
            except:
                pass
    # If no CGPA/percentage found, keep cgpa as None (do not set false defaults)

    # 3. Degree & Department
    degree = "B.E / B.Tech"
    degree_patterns = [
        (r'\b(m\.?tech|m\.?e\.?|master\s+of\s+engineering)\b', "M.E / M.Tech"),
        (r'\b(mca|master\s+of\s+computer\s+applications)\b', "MCA"),
        (r'\b(m\.?sc)\b', "M.Sc"),
        (r'\b(b\.?tech|bachelor\s+of\s+technology)\b', "B.Tech"),
        (r'\b(b\.?e\.?|bachelor\s+of\s+engineering)\b', "B.E"),
        (r'\b(bca|bachelor\s+of\s+computer\s+applications)\b', "BCA"),
        (r'\b(b\.?sc)\b', "B.Sc"),
        (r'\b(mba|master\s+of\s+business\s+administration)\b', "MBA"),
        (r'\b(b\.?com|bba)\b', "B.Com / BBA"),
        (r'\b(diploma)\b', "Diploma")
    ]
    for pat, deg_name in degree_patterns:
        if re.search(pat, clean):
            degree = deg_name
            break

    return {
        'passout_year': passout_year,
        'cgpa': cgpa,
        'degree': degree
    }

def extract_skills(text: str) -> Dict[str, Any]:
    clean = text.lower()
    found_skills_by_category = {}
    all_matched_skills = set()
    
    for category, skill_list in SKILLS_TAXONOMY.items():
        matched = []
        for skill in skill_list:
            # Word boundary matching
            pat = r'\b' + re.escape(skill) + r'\b'
            if re.search(pat, clean):
                matched.append(skill)
                all_matched_skills.add(skill)
        if matched:
            found_skills_by_category[category] = matched

    return {
        'categorized': found_skills_by_category,
        'all_skills': sorted(list(all_matched_skills))
    }

def extract_projects(text: str) -> List[Dict[str, str]]:
    clean = text
    # Identify project section
    project_headers = [
        r'(?:academic\s+)?projects?(?:\s+details|\s+work|\s+undertaken)?',
        r'key\s+projects?',
        r'personal\s+projects?',
        r'mini\s+projects?'
    ]
    
    header_regex = r'(?i)\n(?:[0-9\.\-\*#\s]*)(?:' + '|'.join(project_headers) + r')[:\s]*(?:\n|\r\n)'
    m = re.search(header_regex, clean)
    
    projects = []
    if m:
        start_pos = m.end()
        # Find next section header (e.g. EDUCATION, SKILLS, CERTIFICATIONS, DECLARATION)
        next_section_m = re.search(r'(?i)\n(?:[0-9\.\-\*#\s]*)(?:education|skills|certifications|achievements|declaration|personal\s+details|experience|internships?)[:\s]*(?:\n|\r\n)', clean[start_pos:])
        end_pos = start_pos + next_section_m.start() if next_section_m else start_pos + 1200
        
        project_text = clean[start_pos:end_pos].strip()
        
        # Split project items by bullet points or empty lines
        items = re.split(r'\n(?=[•\-\*■►]|\d+\.|\bTitle|\bProject\s*:)', project_text)
        for item in items:
            item_str = item.strip()
            if len(item_str) > 15:
                # First line is likely title
                item_lines = item_str.split('\n')
                title = re.sub(r'^[•\-\*■►\d\.\s]+', '', item_lines[0]).strip()
                desc = "\n".join(item_lines[1:]).strip() if len(item_lines) > 1 else ""
                projects.append({
                    'title': title[:100],
                    'description': desc[:300]
                })
                if len(projects) >= 4:
                    break

    # If no explicit projects found, extract lines mentioning "system", "app", "model", "portal"
    if not projects:
        lines = [l.strip() for l in clean.split('\n') if len(l.strip()) > 20]
        for l in lines:
            if any(term in l.lower() for term in ['system', 'detection', 'prediction', 'management', 'portal', 'application', 'chatbot']):
                projects.append({
                    'title': l[:80],
                    'description': l[80:250]
                })
                if len(projects) >= 3:
                    break

    return projects

def parse_resume(filename: str, raw_text: str) -> Dict[str, Any]:
    cleaned_text = clean_extracted_text(raw_text)
    name = extract_candidate_name(filename, cleaned_text)
    contacts = extract_contact_info(cleaned_text)
    education = extract_education(cleaned_text)
    skills_data = extract_skills(cleaned_text)
    projects = extract_projects(cleaned_text)

    return {
        'filename': filename,
        'name': name,
        'email': contacts['email'],
        'phone': contacts['phone'],
        'github': contacts['github'],
        'linkedin': contacts['linkedin'],
        'passout_year': education['passout_year'],
        'cgpa': education['cgpa'],
        'degree': education['degree'],
        'skills': skills_data['all_skills'],
        'categorized_skills': skills_data['categorized'],
        'projects': projects,
        'raw_text': cleaned_text
    }
