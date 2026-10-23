"""
Default Job Descriptions provided by the recruiter.
Each JD defines:
- id: unique slug
- title: display title
- department / role
- raw_text: the full verbatim JD text
- key_skills: prioritized dictionary of skill keywords with relative importance weights
- preferred_categories: list of primary matching job categories
- project_keywords: terms indicating strong hands-on project alignment
"""

DEFAULT_JDS = [
    {
        "id": "ai-engineer",
        "title": "AI Engineer (Agentic AI & LLMs)",
        "department": "Engineering / AI",
        "badge_color": "#8b5cf6", # Purple
        "preferred_categories": ["Agentic AI", "AI/ML", "Backend"],
        "key_skills": {
            # Highest weight (Agentic & GenAI)
            "agentic ai": 5.0,
            "mcp": 5.0,
            "model context protocol": 5.0,
            "tool calling": 5.0,
            "function calling": 4.5,
            "rag": 4.5,
            "retrieval augmented generation": 4.5,
            "llm": 4.5,
            "llms": 4.5,
            "generative ai": 4.5,
            "genai": 4.0,
            "langchain": 4.0,
            "langgraph": 4.5,
            "crewai": 4.0,
            "llamaindex": 4.0,
            "multi-agent": 4.5,
            # Core languages & foundations
            "python": 4.0,
            "java": 3.0,
            "sql": 3.0,
            "git": 2.5,
            "github": 2.5,
            # Cloud & deployment
            "aws": 3.0,
            "azure": 3.0,
            "gcp": 3.0,
            # ML & frameworks
            "pytorch": 3.0,
            "tensorflow": 2.5,
            "huggingface": 3.5,
            "transformers": 3.5,
            "vector database": 3.5,
            "chromadb": 3.5,
            "faiss": 3.5,
            "pinecone": 3.5,
            "api development": 3.0,
            "fastapi": 3.0,
            "leadership": 2.5,
            "mentoring": 2.5,
            "problem-solving": 2.0,
            "communication": 2.0
        },
        "project_keywords": [
            "rag", "agent", "agents", "llm", "chatbot", "genai", "prompt engineering",
            "langchain", "crewai", "semantic search", "embedding", "autonomous", "tool calling"
        ],
        "raw_text": """AI ENGINEER 
 
🔹 KEY SKILLS & REQUIREMENTS
✅ Strong hands-on experience in Python or Java
✅ Hands-on experience with RAG & LLMs
✅ Experience with Generative AI & Agentic AI
✅ Knowledge of MCP (Model Context Protocol), Tool calling
✅ Good knowledge of SQL & Git/GitHub
✅ Hands-on experience with AWS / Azure / GCP
✅ Experience leading and mentoring AI Engineering teams
✅ Strong problem-solving and AI application development skills
✅ Excellent communication and leadership skills"""
    },
    {
        "id": "full-stack-java",
        "title": "Full Stack Developer / Java Developer",
        "department": "Engineering / Web Development",
        "badge_color": "#06b6d4", # Cyan
        "preferred_categories": ["Full Stack", "Backend", "Frontend"],
        "key_skills": {
            # Backend core
            "java": 5.0,
            "spring": 4.5,
            "spring boot": 4.5,
            "full stack": 4.5,
            "node.js": 3.5,
            "nodejs": 3.5,
            "python": 3.0,
            ".net": 2.5,
            # Frontend core
            "react": 4.5,
            "react.js": 4.5,
            "reactjs": 4.5,
            "angular": 4.0,
            "vue": 3.5,
            "vue.js": 3.5,
            "javascript": 4.0,
            "typescript": 4.0,
            "html": 2.5,
            "css": 2.5,
            # Database
            "sql": 4.0,
            "mysql": 3.5,
            "postgresql": 3.5,
            "mongodb": 3.5,
            "nosql": 3.5,
            # Architecture & DevOps
            "rest api": 4.0,
            "restful": 4.0,
            "microservices": 4.5,
            "git": 3.0,
            "ci/cd": 3.5,
            "docker": 3.0,
            "aws": 3.5,
            "azure": 3.5,
            "gcp": 3.0,
            # AI exposure & soft skills
            "generative ai": 2.5,
            "ai/ml": 2.5,
            "code review": 2.5,
            "problem-solving": 2.0,
            "communication": 2.0
        },
        "project_keywords": [
            "full stack", "web application", "react", "spring boot", "rest api",
            "microservices", "crud", "frontend", "backend", "portal", "e-commerce"
        ],
        "raw_text": """🚀 WE'RE HIRING | FULL STACK DEVELOPER / JAVA DEVELOPER

🔹 KEY SKILLS & REQUIREMENTS
✅ Strong experience in Java or Full Stack Development
✅ Hands-on experience with React, Angular, Vue.js, or similar frontend technologies
✅ Strong backend experience with Java, Node.js, Python, .NET, or similar technologies
✅ Good knowledge of SQL/NoSQL databases
✅ Hands-on experience with AWS or Azure or GCP
✅ Experience with REST APIs, Microservices, Git, and CI/CD pipelines
✅ Experience in code review and development best practices
✅ Exposure to AI models, AI/ML, or Generative AI
✅ Strong problem-solving, analytical, and communication skills"""
    },
    {
        "id": "ar-caller",
        "title": "AR Caller – Client Outreach & Appointment Setting",
        "department": "Operations / Healthcare & Client Services",
        "badge_color": "#10b981", # Emerald
        "preferred_categories": ["AR Calling", "Business Development", "Other"],
        "key_skills": {
            # Core AR Calling & Communication
            "cold calling": 5.0,
            "client outreach": 5.0,
            "appointment setting": 5.0,
            "english communication": 5.0,
            "verbal communication": 4.5,
            "written communication": 4.0,
            "follow-up": 4.5,
            "scheduling": 4.0,
            "client meetings": 4.0,
            "product demos": 3.5,
            "call records": 3.5,
            "relationship building": 3.5,
            "accounts receivable": 4.0,
            "ar calling": 4.5,
            "denial management": 3.5,
            "rcm": 3.5,
            "revenue cycle": 3.5,
            "hipaa": 3.0,
            "crm": 3.0,
            "email outreach": 3.5,
            "persistence": 2.5,
            "proactive": 2.5
        },
        "project_keywords": [
            "calling", "telecalling", "outreach", "appointment", "demo",
            "accounts receivable", "client relations", "cold call", "customer support"
        ],
        "raw_text": """🚀 HIRING | AR Caller – Client Outreach & Appointment Setting
 
🔹 KEY RESPONSIBILITIES
✅ Make cold calls to potential clients and generate business interest
✅ Demonstrate excellent English communication over calls and emails
✅ Follow up with prospects through calls and professional emails
✅ Schedule client meetings, team calls, and appointments with the CEO
✅ Coordinate product demos with prospective clients
✅ Maintain call records, follow-up schedules, and prospect details
✅ Coordinate with internal teams to ensure smooth communication and timely follow-ups
🔹 REQUIRED SKILLS
✅ Excellent verbal and written English communication skills
✅ Interest in cold calling, client outreach, and relationship building
✅ Strong follow-up, scheduling, and coordination skills
✅ Confidence in speaking with clients and senior stakeholders
✅ Proactive attitude, persistence, and willingness to learn"""
    },
    {
        "id": "us-bd-sales",
        "title": "Business Development – US Sales (AI & Technology)",
        "department": "Sales & Business Development",
        "badge_color": "#f59e0b", # Amber
        "preferred_categories": ["Business Development", "AR Calling", "Other"],
        "key_skills": {
            # Core Sales & Outreach
            "business development": 5.0,
            "b2b sales": 5.0,
            "us sales": 5.0,
            "lead generation": 4.5,
            "enterprise sales": 4.5,
            "cold calling": 4.0,
            "email outreach": 4.0,
            "linkedin outreach": 4.0,
            "prospecting": 4.0,
            "deal closure": 4.5,
            "sales pipeline": 4.0,
            "crm": 4.0,
            "salesforce": 4.0,
            "hubspot": 4.0,
            # Tech knowledge
            "saas": 4.0,
            "ai": 3.5,
            "automation": 3.5,
            "it services": 3.5,
            "technology solutions": 3.5,
            # Strategy & Management
            "team leadership": 4.0,
            "cxo": 4.0,
            "c-level": 4.0,
            "client relationship": 4.0,
            "presentation": 3.5,
            "negotiation": 4.0,
            "kpi": 3.0,
            "revenue growth": 4.0,
            "forecasting": 3.0,
            "english communication": 4.0
        },
        "project_keywords": [
            "sales", "lead generation", "business development", "crm", "b2b",
            "prospecting", "marketing", "pipeline", "client acquisition", "outreach"
        ],
        "raw_text": """Job Description: Business Development – US Sales (AI & Technology)
Job Overview
We are looking for a dynamic and results-driven Business Development – US Sales to lead our Business Development and Lead Generation teams, drive revenue growth, and expand our presence in the US market. The ideal candidate will have proven experience in US B2B sales, enterprise client acquisition, team leadership, and selling SaaS, AI, Automation, IT Services, or technology solutions.
The candidate will be responsible for generating and converting high-value business opportunities, building strong relationships with CXOs and key decision-makers, managing the sales pipeline, and driving the team toward achieving business and revenue targets."""
    }
]

def get_default_jds():
    return DEFAULT_JDS

def get_jd_by_id(jd_id: str):
    for jd in DEFAULT_JDS:
        if jd["id"] == jd_id:
            return jd
    return DEFAULT_JDS[0]
