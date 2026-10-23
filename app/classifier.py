from typing import Dict, List, Tuple, Any

# Signature keywords and weights for each category
CATEGORY_RULES = {
    'Agentic AI': {
        'high_signal': ['agentic ai', 'agentic', 'langgraph', 'crewai', 'autogen', 'mcp', 'model context protocol', 'tool calling', 'function calling', 'llamaindex', 'multi-agent', 'agent framework'],
        'skills': ['rag', 'retrieval augmented generation', 'langchain', 'semantic kernel', 'autonomous', 'vector database', 'chromadb', 'pinecone', 'generative ai', 'prompt engineering', 'llm', 'llms'],
        'projects': ['agent', 'rag', 'crewai', 'langchain', 'autonomous', 'tool call', 'multi-agent', 'chatbot', 'llm assistant']
    },
    'AI/ML': {
        'high_signal': ['machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn', 'opencv', 'computer vision', 'natural language processing', 'nlp'],
        'skills': ['python', 'transformers', 'huggingface', 'cnn', 'rnn', 'lstm', 'pandas', 'numpy', 'scipy', 'keras', 'xgboost', 'random forest', 'yolo', 'data science', 'generative ai', 'llm'],
        'projects': ['prediction', 'classification', 'detection', 'recommendation', 'neural network', 'model training', 'computer vision', 'sentiment analysis']
    },
    'Frontend': {
        'high_signal': ['react', 'react.js', 'reactjs', 'angular', 'angularjs', 'vue', 'vue.js', 'vuejs', 'next.js', 'nextjs', 'svelte'],
        'skills': ['html', 'html5', 'css', 'css3', 'javascript', 'typescript', 'tailwind', 'tailwindcss', 'bootstrap', 'redux', 'sass', 'scss', 'responsive design', 'material ui', 'vite'],
        'projects': ['frontend', 'ui', 'user interface', 'responsive', 'landing page', 'portfolio', 'web page', 'dashboard ui']
    },
    'Backend': {
        'high_signal': ['django', 'fastapi', 'flask', 'spring', 'spring boot', 'express', 'express.js', 'nodejs', 'node.js', 'golang', 'laravel', 'asp.net'],
        'skills': ['java', 'python', 'sql', 'mysql', 'postgresql', 'mongodb', 'rest api', 'restful api', 'microservices', 'c#', '.net', 'php', 'c++', 'graphql', 'redis'],
        'projects': ['backend', 'api', 'server', 'database', 'rest api', 'microservices', 'crud', 'authentication', 'jwt']
    },
    'Full Stack': {
        'high_signal': ['full stack', 'fullstack', 'mern', 'mean', 'pern', 'full stack developer'],
        'skills': ['react', 'node.js', 'express', 'mongodb', 'javascript', 'java', 'spring boot', 'html', 'css', 'sql'],
        'projects': ['full stack', 'mern', 'end-to-end', 'web application', 'e-commerce', 'portal', 'management system']
    },
    'Data Analyst': {
        'high_signal': ['data analyst', 'data analysis', 'power bi', 'powerbi', 'tableau', 'business intelligence', 'bigquery', 'looker'],
        'skills': ['excel', 'advanced excel', 'vlookup', 'pivot table', 'sql', 'statistics', 'eda', 'seaborn', 'matplotlib', 'dashboards', 'data visualization'],
        'projects': ['data analysis', 'dashboard', 'power bi', 'tableau', 'insights', 'analytics', 'sales analysis', 'kpi']
    },
    'Business Development': {
        'high_signal': ['business development', 'b2b sales', 'b2b', 'enterprise sales', 'lead generation', 'salesforce', 'hubspot', 'client acquisition'],
        'skills': ['cold calling', 'client outreach', 'crm', 'prospecting', 'linkedin outreach', 'deal closure', 'sales pipeline', 'negotiation', 'revenue generation', 'us sales'],
        'projects': ['sales', 'lead gen', 'client acquisition', 'revenue growth', 'prospecting', 'campaign', 'business development']
    },
    'AR Calling': {
        'high_signal': ['ar calling', 'ar caller', 'accounts receivable', 'denial management', 'revenue cycle management', 'rcm', 'us healthcare'],
        'skills': ['cold calling', 'calling', 'claim follow-up', 'payer follow-up', 'hipaa', 'appointment setting', 'patient billing', 'medical billing', 'insurance verification', 'english communication'],
        'projects': ['calling', 'telecalling', 'outreach', 'denial management', 'appointment', 'accounts receivable']
    },
    'QA/Testing': {
        'high_signal': ['qa', 'quality assurance', 'manual testing', 'automation testing', 'selenium', 'cypress', 'test automation', 'test cases'],
        'skills': ['junit', 'testng', 'postman', 'jira', 'bug tracking', 'api testing', 'regression testing', 'cucumber', 'playwright', 'functional testing'],
        'projects': ['testing', 'automation test', 'selenium', 'test suite', 'test cases', 'quality assurance']
    },
    'DevOps': {
        'high_signal': ['devops', 'kubernetes', 'k8s', 'docker', 'ci/cd', 'terraform', 'jenkins', 'ansible', 'helm'],
        'skills': ['aws', 'azure', 'gcp', 'git', 'github actions', 'gitlab', 'linux', 'cloud computing', 'nginx'],
        'projects': ['pipeline', 'deployment', 'dockerization', 'cluster', 'infrastructure', 'cloud infrastructure', 'ci/cd']
    },
    'UI/UX': {
        'high_signal': ['ui/ux', 'ui designer', 'ux designer', 'figma', 'adobe xd', 'wireframing', 'user research'],
        'skills': ['prototyping', 'design systems', 'canva', 'interaction design', 'user experience', 'user interface', 'visual design'],
        'projects': ['ui/ux design', 'figma', 'prototype', 'wireframe', 'case study', 'redesign', 'mobile app ui']
    }
}

ALL_CATEGORIES = [
    'Frontend', 'Backend', 'Full Stack', 'Agentic AI', 'AI/ML',
    'Data Analyst', 'Business Development', 'AR Calling', 'QA/Testing',
    'DevOps', 'UI/UX', 'Other'
]

def classify_resume(skills: List[str], projects: List[Dict[str, str]], raw_text: str) -> Dict[str, Any]:
    skills_text = " ".join(skills).lower()
    project_text = " ".join([p.get('title', '') + " " + p.get('description', '') for p in projects]).lower()
    full_text = raw_text.lower()
    
    category_scores = {}
    
    for cat, rules in CATEGORY_RULES.items():
        score = 0.0
        
        # 1. Skills Field (Highest Priority - 55%)
        skills_matched = 0
        high_signal_matched = 0
        
        for hs in rules['high_signal']:
            if hs in skills_text or hs in full_text[:400]:
                high_signal_matched += 1
                
        for s in rules['skills']:
            if s in skills_text:
                skills_matched += 1
                
        skill_score = (high_signal_matched * 25.0) + (skills_matched * 8.0)
        
        # 2. Projects Field (Secondary Priority - 30%)
        proj_matched = 0
        for pw in rules['projects']:
            if pw in project_text:
                proj_matched += 1
        proj_score = min(35.0, proj_matched * 12.0)
        
        # 3. Overall Text / Mentions (15%)
        text_mentions = 0
        for hs in rules['high_signal']:
            if hs in full_text:
                text_mentions += 1
        text_score = min(15.0, text_mentions * 5.0)
        
        total = skill_score + proj_score + text_score
        category_scores[cat] = round(total, 1)

    # Full Stack detection: if both Frontend and Backend are strong
    fe_score = category_scores.get('Frontend', 0)
    be_score = category_scores.get('Backend', 0)
    fs_direct = category_scores.get('Full Stack', 0)
    
    if (fe_score >= 20 and be_score >= 20) or fs_direct >= 25:
        category_scores['Full Stack'] = max(category_scores.get('Full Stack', 0), (fe_score + be_score) * 0.75 + 15.0)
        
    # Agentic AI detection: boost if agentic keywords present
    if category_scores.get('Agentic AI', 0) >= 30:
        # Give Agentic AI distinct prominence over generic AI/ML
        category_scores['Agentic AI'] += 10.0

    # Sort categories by score
    sorted_cats = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
    
    top_cat, top_score = sorted_cats[0]
    
    if top_score < 15.0:
        primary_category = "Other"
        secondary_categories = []
    else:
        primary_category = top_cat
        secondary_categories = [
            cat for cat, s in sorted_cats[1:3]
            if s >= 18.0 and cat != primary_category and cat != 'Other'
        ]

    # Normalize scores to 0-100 range for display
    normalized_scores = {
        cat: min(100, int(round((s / max(top_score, 50.0)) * 100))) if top_score > 0 else 0
        for cat, s in category_scores.items()
    }

    return {
        'primary_category': primary_category,
        'secondary_categories': secondary_categories,
        'category_scores': normalized_scores
    }
