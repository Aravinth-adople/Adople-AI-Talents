import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Briefcase,
  Star,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Code2,
  PhoneCall,
  DollarSign
} from 'lucide-react';
import { fetchStats, fetchJds } from '../services/api';
import { CATEGORY_COLORS } from '../utils/constants';
import DomainKeycard from '../components/DomainKeycard';

import bgAiEngineer from '../assets/jd_ai_engineer.jpg';
import bgArCaller from '../assets/jd_ar_caller.jpg';
import bgUsBdSales from '../assets/jd_us_bd_sales.jpg';
import bgFullStackJava from '../assets/jd_full_stack_java.jpg';

const JDBACKGROUNDS = {
  'ai-engineer': bgAiEngineer,
  'ar-caller': bgArCaller,
  'us-bd-sales': bgUsBdSales,
  'full-stack-java': bgFullStackJava
};

const JDMETADATA = {
  'ai-engineer': {
    shortTitle: 'AI Engineer',
    subtitle: 'Agentic AI & LLMs',
    deptTag: 'ENGINEERING',
    roleTag: 'Agentic AI Systems',
    topFit: '96%',
    candidateNote: '219 Top Candidates'
  },
  'ar-caller': {
    shortTitle: 'AR Caller',
    subtitle: 'Client Outreach & RCM',
    deptTag: 'OPERATIONS',
    roleTag: 'US Healthcare Services',
    topFit: '75%',
    candidateNote: 'Client Outreach'
  },
  'us-bd-sales': {
    shortTitle: 'Business Dev',
    subtitle: 'B2B Sales & Tech',
    deptTag: 'SALES & GROWTH',
    roleTag: 'B2B Tech Expansion',
    topFit: '82%',
    candidateNote: 'Enterprise Pipeline'
  },
  'full-stack-java': {
    shortTitle: 'Full Stack Dev',
    subtitle: 'Java, Spring & Cloud',
    deptTag: 'ENGINEERING',
    roleTag: 'Web & Microservices',
    topFit: '90%',
    candidateNote: '136 High Matches'
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, jdsData] = await Promise.all([
          fetchStats('ai-engineer'),
          fetchJds()
        ]);
        setStats(statsData);
        setJds(jdsData.jds || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalResumes = stats?.total_resumes || 3159;
  const count2027 = stats?.passout_year_counts?.[2027] || stats?.passout_year_counts?.['2027'] || 1187;
  const shortlistedCount = stats?.shortlisted_count || 0;
  const categoryCounts = stats?.category_counts || {};

  // JD icons mapping
  const jdIcons = {
    'ai-engineer': <Cpu size={22} color="#7c3aed" />,
    'full-stack-java': <Code2 size={22} color="#0891b2" />,
    'ar-caller': <PhoneCall size={22} color="#059669" />,
    'us-bd-sales': <DollarSign size={22} color="#d97706" />
  };

  return (
    <div className="page-container">
      {/* Welcome Hero Banner */}
      <section className="dashboard-hero">
        <div className="hero-text">

          <h1 className="hero-title">Candidate Pipeline &amp; Classification Dashboard</h1>
          <p className="hero-subtitle">
            Automated resume scanning, category classification, and skill-match scoring for {totalResumes.toLocaleString()} verified candidates across engineering and operations roles.
          </p>
        </div>

        <div className="hero-actions">
          <Link to="/upload" className="btn btn-primary" style={{ padding: '9px 18px', textDecoration: 'none' }}>
            <UploadCloud size={16} />
            <span>Batch Upload Resumes</span>
          </Link>
          <Link to="/candidates" className="btn btn-secondary" style={{ padding: '9px 18px', textDecoration: 'none' }}>
            <Users size={16} />
            <span>Browse Directory</span>
          </Link>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="kpis-grid">
        <div className="metric-card">
          <div className="metric-card-inner">
            <div className="metric-header">
              <span className="metric-label">Total Verified Resumes</span>
              <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#004AAC' }}>
                <Users size={18} />
              </div>
            </div>
            <div className="metric-body">
              <span className="metric-value">{totalResumes.toLocaleString()}</span>
              <span className="metric-sub">Ingested &amp; classified in database</span>
            </div>
          </div>
        </div>

        {/* 2027 Batch Highlight Card */}
        <div
          className="metric-card highlight-card-2027"
          onClick={() => navigate('/candidates?year=2027')}
          title="Click to view all 2027 batch candidates"
        >
          <div className="metric-card-inner">
            <div className="metric-header">
              <span className="metric-label">2027 Passout Batch</span>
              <div className="metric-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                <GraduationCap size={18} />
              </div>
            </div>
            <div className="metric-body">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="metric-value" style={{ color: '#059669' }}>
                  {count2027.toLocaleString()}
                </span>
                <span className="batch-pill-accent">2027 Ready</span>
              </div>
              <span className="metric-sub" style={{ color: '#047857' }}>
                Click to view 2027 graduation talent &rarr;
              </span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-inner">
            <div className="metric-header">
              <span className="metric-label">Shortlisted Candidates</span>
              <div className="metric-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
                <Star size={18} />
              </div>
            </div>
            <div className="metric-body">
              <span className="metric-value">{shortlistedCount.toLocaleString()}</span>
              <span className="metric-sub">Marked as high potential</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-inner">
            <div className="metric-header">
              <span className="metric-label">Domains Classified</span>
              <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#004AAC' }}>
                <Briefcase size={18} />
              </div>
            </div>
            <div className="metric-body">
              <span className="metric-value">12 Domains</span>
              <span className="metric-sub">Skills &amp; project evaluation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Job Openings Pipelines */}
      <section className="section-block">
        <div className="section-heading-row">
          <div>
            <h2 className="section-title">Active Job Roles &amp; Evaluation Pipelines</h2>
            <p className="section-desc">
              Review candidates scored specifically against the requirements of each role.
            </p>
          </div>
        </div>

        <div className="jd-cards-grid">
          {jds.map(jd => {
            const meta = JDMETADATA[jd.id] || {
              shortTitle: jd.title.split(' - ')[0].split(' (')[0],
              subtitle: jd.department || 'Active Role',
              deptTag: 'ROLE PIPELINE',
              roleTag: 'Active Opening',
              topFit: '90%',
              candidateNote: 'High Potential'
            };
            const bgImg = JDBACKGROUNDS[jd.id] || bgAiEngineer;

            return (
              <div
                key={jd.id}
                className="taskello-jd-card"
                onClick={() => navigate(`/candidates?jd=${jd.id}`)}
                title={`Click to review candidates for ${jd.title}`}
              >
                {/* Background Artwork Layer */}
                <div
                  className="taskello-card-bg"
                  style={{ backgroundImage: `url(${bgImg})` }}
                >
                  <div className="taskello-card-bg-overlay" />

                  {/* Top Right Header Badge (from Taskello reference) */}
                  <div className="taskello-card-badge-top">
                    <span className="taskello-badge-dept">{meta.deptTag}</span>
                    <span className="taskello-badge-role">{meta.roleTag}</span>
                  </div>
                </div>

                {/* Foreground Folder Cutout Layer */}
                <div className="taskello-folder-container">
                  {/* Folder Tab Shape Header */}
                  <div className="taskello-folder-tab-bar">
                    <div className="taskello-folder-tab-left">
                      <h3 className="taskello-card-title">{meta.shortTitle}</h3>
                      <p className="taskello-card-subtitle">{meta.subtitle}</p>
                    </div>

                    {/* Smooth S-curve slope connector */}
                    <svg
                      className="taskello-folder-slope"
                      viewBox="0 0 32 64"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M 0,0 C 16,0 16,30 32,30 L 32,64 L 0,64 Z"
                        fill="currentColor"
                      />
                    </svg>

                    <div className="taskello-folder-tab-shelf" />
                  </div>

                  {/* Folder Body Content */}
                  <div className="taskello-folder-body">
                    {/* Key Skill Chips */}
                    <div className="taskello-skills-row">
                      {Object.keys(jd.key_skills || {}).slice(0, 4).map(skill => (
                        <span key={skill} className="taskello-skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Footer Stats Row: 05 Doc / 1270 Notes aesthetic */}
                    <div className="taskello-footer-row">
                      <div className="taskello-footer-stat">
                        <span className="taskello-stat-number">{meta.topFit}</span>
                        <span className="taskello-stat-label">Top Fit</span>
                      </div>

                      <div className="taskello-footer-action">
                        <span>Review Candidates</span>
                        <ArrowRight size={14} className="taskello-action-arrow" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Category Breakdown & Passout Distribution */}
      <div className="two-columns-layout">
        {/* Categories Grid */}
        <section className="section-block">
          <div className="section-heading-row">
            <div>
              <h2 className="section-title">Classification by Domain (12 Categories)</h2>
              <p className="section-desc">Priority: Technical Skills (55%), Projects (30%), Experience (15%)</p>
            </div>
          </div>

          <div className="categories-grid-cards">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <DomainKeycard
                key={cat}
                category={cat}
                count={count}
                onClick={() => navigate(`/candidates?category=${encodeURIComponent(cat)}`)}
              />
            ))}
          </div>
        </section>

        {/* Passout Year Distribution */}
        <section className="section-block">
          <div className="section-heading-row">
            <div>
              <h2 className="section-title">Graduation Year Distribution</h2>
              <p className="section-desc">Passout timeline including freshers &amp; upcoming 2027 graduates</p>
            </div>
          </div>

          <div className="simple-years-card">
            {[
              { year: 2027, label: '2027 Final Year Batch', subtitle: 'Upcoming Graduates · Immediate Ready', count: count2027, highlight: true },
              { year: 2026, label: '2026 Fresher Batch', subtitle: 'Fresher Pipeline', count: stats?.passout_year_counts?.[2026] || 759 },
              { year: 2025, label: '2025 Active Batch', subtitle: '1 Year Experience', count: stats?.passout_year_counts?.[2025] || 598 },
              { year: 2024, label: '2024 Alumni Batch', subtitle: '2 Years Experience', count: stats?.passout_year_counts?.[2024] || 262 },
              { year: 2023, label: '2023 Alumni Batch', subtitle: '3 Years Experience', count: stats?.passout_year_counts?.[2023] || 144 },
              { year: 2022, label: '2022 & Older', subtitle: 'Senior Experienced Pool', count: stats?.passout_year_counts?.[2022] || 208 }
            ].map(item => {
              const percent = Math.round((item.count / totalResumes) * 100);
              return (
                <div
                  key={item.year}
                  className={`simple-year-row ${item.highlight ? 'simple-year-highlight' : ''}`}
                  onClick={() => navigate(`/candidates?year=${item.year}`)}
                  title={`Filter ${item.count.toLocaleString()} candidates from ${item.year} batch`}
                >
                  <div className="simple-year-left">
                    <span className={`simple-year-badge ${item.highlight ? 'badge-green' : ''}`}>
                      {item.year}
                    </span>
                    <div className="simple-year-info">
                      <span className="simple-year-title">{item.label}</span>
                      <span className="simple-year-sub">{item.subtitle}</span>
                    </div>
                  </div>

                  <div className="simple-year-progress-wrap">
                    <div className="simple-year-bar-track">
                      <div
                        className={`simple-year-bar-fill ${item.highlight ? 'fill-green' : ''}`}
                        style={{ width: `${Math.max(4, percent)}%` }}
                      />
                    </div>
                    <span className="simple-year-pct">{percent}%</span>
                  </div>

                  <div className="simple-year-right">
                    <span className="simple-year-count">{item.count.toLocaleString()}</span>
                    <ArrowRight size={14} className="simple-year-arrow" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
