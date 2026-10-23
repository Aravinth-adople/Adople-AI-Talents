# 🚀 Adople AI Talents — Executive Resume Classification & JD Match Platform

An intelligent, enterprise-grade talent classification and job-fit analysis system designed to ingest, parse, classify, benchmark, and evaluate thousands of technical resumes against customizable Job Descriptions (JDs) with precision and speed.

---

## 🌟 Key Highlights & Capabilities

* **⚡ High-Throughput Resume Parsing:** Ingests and extracts structured metadata from raw **PDF, DOCX, and TXT** documents (supporting thousands of candidates concurrently).
* **🎯 12 Technical Domain Classifications:** Automatically categorizes profiles into specialized domains (*Agentic AI, AI/ML, Full Stack, Data Analyst, Frontend, Backend, DevOps, QA/Testing, UI/UX, Business Development, AR Calling, and more*).
* **📊 Multi-JD Fit Benchmarking:** Calculates weighted match scores across multiple job descriptions simultaneously, with instant re-ranking and fit-score breakdowns.
* **🤖 Azure OpenAI Batch Evaluation:** Seamless background evaluation using Azure OpenAI to generate executive summaries, assess technical strengths, detect skill gaps, and provide hiring recommendations.
* **📄 In-App Document Viewer & Downloader:** Instant inline document previewing with PDF rendering alongside direct one-click resume downloads.
* **📈 Dual-Format Filterable Exports:**
  * **Export CSV (`.csv`):** Comprehensive 28-column candidate dataset with UTF-8 BOM, sanitized single-line formatting, and direct resume download links.
  * **Export Excel (`.xlsx`):** Professional workbook with **native AutoFilter enabled across all 28 columns**, freeze panes, styled headers, and clickable hyperlinks.
* **✨ High-Precision Academic Metrics:** Smart percentage-to-10-point CGPA normalization with strict avoidance of unverified default grades (cleanly represented as `-`).

---

## 🏗️ Architecture & Technology Stack

```
                          ┌─────────────────────────────────────┐
                          │     React 19 + Vite Frontend SPA    │
                          │   (Tailored CSS, Lucide, Multi-Tab)  │
                          └──────────────────┬──────────────────┘
                                             │ HTTP / JSON / Streams
                                             ▼
                          ┌─────────────────────────────────────┐
                          │        FastAPI Python Backend       │
                          │      (Async REST API & Static SPA)  │
                          └──────┬───────────┬────────────┬─────┘
                                 │           │            │
            ┌────────────────────┘           │            └────────────────────┐
            ▼                                ▼                                 ▼
┌───────────────────────┐        ┌───────────────────────┐         ┌───────────────────────┐
│   Parsing & Scoring   │        │     SQLite Database   │         │    Azure OpenAI API   │
│ (PyMuPDF, docx, JDs)  │        │ (WAL Mode, Indexed)   │         │ (Batch Evaluator)     │
└───────────────────────┘        └───────────────────────┘         └───────────────────────┘
```

### Backend
* **FastAPI:** High-performance, asynchronous REST API framework.
* **SQLite (WAL Mode):** Indexed database optimized for sub-millisecond filtering and sorting across 3,000+ candidates.
* **PyMuPDF & python-docx:** Document text extraction and structure parsing.
* **openpyxl:** Excel workbook generation with native XML AutoFilter definitions.

### Frontend
* **React 19 & Vite:** Modern reactive SPA with rapid HMR.
* **Lucide React:** Clean visual icons and status indicators.
* **Vanilla Design Tokens:** Fast, lightweight CSS architecture with zero bulky runtime CSS dependencies.

---

## 📁 Repository Structure

```
.
├── app/
│   ├── server.py             # FastAPI entrypoint, routes, resume streaming & exports
│   ├── database.py           # SQLite schema, indexing, search queries & transactions
│   ├── parser.py             # Regex & heuristic document parser (CGPA, skills, contacts)
│   ├── classifier.py         # Multi-label taxonomy classification engine
│   ├── scorer.py             # Job Description weighted matching algorithm
│   ├── default_jds.py        # Configured default Job Descriptions (AI Engineer, etc.)
│   ├── azure_ai.py           # Azure OpenAI client for candidate evaluation
│   ├── batch_evaluator.py    # Threadpool-based background batch evaluation worker
│   ├── sync_resumes.py       # Offline directory sync & resume ingestion script
│   ├── resumes_app.db        # Indexed candidate database
│   ├── uploads/              # Storage directory for newly uploaded resumes (.gitkeep)
│   └── static/               # Static assets & brand media
├── frontend/
│   ├── src/
│   │   ├── pages/            # CandidatesPage, DashboardPage, UploadPage
│   │   ├── components/       # CandidateTable, CandidateCard, CandidateDrawer, etc.
│   │   ├── services/api.js   # Client HTTP API connector
│   │   ├── utils/            # Constants, color maps, and badge helpers
│   │   ├── index.css         # Global design system and UI stylesheets
│   │   └── App.jsx           # Root layout and client-side routing
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite build & proxy configuration
├── .gitignore                # Root Git ignore rules (node_modules, pycache, logs)
├── .env.example              # Sample environment configuration
├── requirements.txt          # Python backend dependencies
└── README.md                 # Project documentation
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
* **Python 3.10+** (Python 3.11 or 3.12 recommended)
* **Node.js 18+** & **npm**

### 2. Backend Setup
Clone the repository and install the Python dependencies:

```bash
# Clone the repository
git clone https://github.com/Aravinth-adople/Adople-AI-Talents.git
cd Adople-AI-Talents

# (Optional) Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
Install frontend packages and generate the production bundle:

```bash
cd frontend
npm install
npm run build
cd ..
```

---

## 🚀 Running the Application

### Option A: Complete App via FastAPI (Single Server)
FastAPI serves both the backend API and the compiled React production application:

```bash
python -m uvicorn app.server:app --host 127.0.0.1 --port 8000
```
Open your browser at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

### Option B: Development Mode (Hot Reloading)
Run backend and frontend independently for active development:

```bash
# Terminal 1: Backend API
python -m uvicorn app.server:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend Dev Server
cd frontend
npm run dev
```
Open your browser at: **[http://localhost:3000](http://localhost:3000)** (requests to `/api/*` are proxied to port 8000).

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/candidates` | `GET` | Filter, search, paginate, and sort candidates by fit score, CGPA, passout year, status. |
| `/api/candidates/{id}` | `GET` | Detailed candidate profile with active JD score breakdown and AI analysis. |
| `/api/candidates/{id}/status` | `POST` | Update candidate pipeline status (`shortlisted`, `in_review`, `rejected`, `unreviewed`). |
| `/api/file/{id}` | `GET` | In-app inline stream of candidate resume (PDF/DOCX/TXT). |
| `/api/file/{id}/download` | `GET` | Direct attachment download of the candidate's original resume document. |
| `/api/export` | `GET` | Export filtered candidate list (`format=csv` or `format=xlsx`). |
| `/api/jds` | `GET` / `POST` | List all available Job Descriptions or register custom JDs. |
| `/api/stats` | `GET` | Aggregated KPIs, score averages, batch breakdowns, and domain distributions. |
| `/api/upload` | `POST` | Batch upload resumes with real-time extraction and classification. |
| `/api/batch-evaluate/start` | `POST` | Trigger background Azure OpenAI batch evaluation worker. |
| `/docs` | `GET` | Interactive Swagger UI API documentation. |

---

## 🔒 Environment Configuration

Copy `.env.example` to `.env` to configure optional Azure OpenAI evaluation keys:

```bash
cp .env.example .env
```

```env
HOST=127.0.0.1
PORT=8000
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

---

## 📄 License
This project is proprietary and confidential — developed for **Adople AI Talents**.
