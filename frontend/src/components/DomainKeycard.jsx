import React from 'react';

// Contactless RFID Wave Icon (from reference keycard image)
export function RfidWaves({ size = 14, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 7.5C7.2 4.5 11.8 3.5 16 4.5" />
      <path d="M4 11.5C6.5 9 10 8.2 13.5 9" />
      <path d="M4 15.5C5.8 13.5 8.2 13 11 13.5" />
    </svg>
  );
}

// 12 Bespoke Category Logo Emblems related directly to each domain content
export function CategoryLogo({ category, size = 32, color = "currentColor" }) {
  switch (category) {
    case 'AI/ML':
      // Radiating Neural Synapse & Brain Matrix (like Peacock Estate radiating palace art)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* Radiating sunburst energy lines */}
          <line x1="20" y1="2" x2="20" y2="7" />
          <line x1="33" y1="7" x2="29" y2="11" />
          <line x1="38" y1="20" x2="33" y2="20" />
          <line x1="7" y1="7" x2="11" y2="11" />
          <line x1="2" y1="20" x2="7" y2="20" />
          {/* Neural Cortex Matrix */}
          <path d="M12 28C10 25 10 20 13 16C15 13 18 13 20 15C22 13 25 13 27 16C30 20 30 25 28 28C26 31 22 33 20 32C18 33 14 31 12 28Z" fill="currentColor" fillOpacity="0.12" />
          <circle cx="20" cy="19" r="2.5" fill={color} />
          <circle cx="15" cy="24" r="2" fill={color} />
          <circle cx="25" cy="24" r="2" fill={color} />
          <line x1="20" y1="19" x2="15" y2="24" />
          <line x1="20" y1="19" x2="25" y2="24" />
          <line x1="15" y1="24" x2="25" y2="24" />
        </svg>
      );

    case 'Agentic AI':
      // Cybernetic Autonomous Agent Eye & Orbital Rings
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
          <circle cx="20" cy="20" r="14" strokeDasharray="3 3" />
          <ellipse cx="20" cy="20" rx="16" ry="7" transform="rotate(-30 20 20)" />
          <ellipse cx="20" cy="20" rx="16" ry="7" transform="rotate(30 20 20)" />
          <circle cx="20" cy="20" r="5" fill="currentColor" fillOpacity="0.2" />
          <circle cx="20" cy="20" r="2.5" fill={color} />
          {/* 4 Directional Agentic Nodes */}
          <circle cx="20" cy="6" r="1.5" fill={color} />
          <circle cx="34" cy="20" r="1.5" fill={color} />
          <circle cx="20" cy="34" r="1.5" fill={color} />
          <circle cx="6" cy="20" r="1.5" fill={color} />
        </svg>
      );

    case 'Full Stack':
      // 3D Layered Isometric Stack with Code Syntax (Frontend, Backend, DB layers)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round">
          {/* Top Layer */}
          <path d="M20 7L32 13L20 19L8 13Z" fill="currentColor" fillOpacity="0.2" />
          {/* Middle Layer */}
          <path d="M8 18L20 24L32 18" />
          {/* Bottom Layer */}
          <path d="M8 23L20 29L32 23" />
          <path d="M8 28L20 34L32 28" />
          {/* Code symbol on top plate */}
          <path d="M17 11.5L14.5 13L17 14.5" strokeWidth="1.4" />
          <path d="M23 11.5L25.5 13L23 14.5" strokeWidth="1.4" />
        </svg>
      );

    case 'Frontend':
      // Viewport Wireframe & Geometric Pixel Cursor
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6">
          <rect x="7" y="9" width="26" height="22" rx="3.5" fill="currentColor" fillOpacity="0.1" />
          <line x1="7" y1="16" x2="33" y2="16" />
          <circle cx="11" cy="12.5" r="1" fill={color} />
          <circle cx="14" cy="12.5" r="1" fill={color} />
          <circle cx="17" cy="12.5" r="1" fill={color} />
          {/* UI Layout Blocks */}
          <rect x="11" y="19" width="7" height="8" rx="1.5" />
          <line x1="21" y1="20" x2="29" y2="20" />
          <line x1="21" y1="23" x2="27" y2="23" />
          <line x1="21" y1="26" x2="28" y2="26" />
        </svg>
      );

    case 'Backend':
      // Clustered Database Servers & Microservice Nodes
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6">
          <ellipse cx="20" cy="10" rx="12" ry="4" fill="currentColor" fillOpacity="0.15" />
          <path d="M8 10V18C8 20.2 13.4 22 20 22C26.6 22 32 20.2 32 18V10" />
          <path d="M8 18V26C8 28.2 13.4 30 20 30C26.6 30 32 28.2 32 26V18" />
          <circle cx="26" cy="14" r="1.2" fill={color} />
          <circle cx="26" cy="22" r="1.2" fill={color} />
        </svg>
      );

    case 'Data Analyst':
      // Analytical Radar Spire & Rising Growth Trend
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6">
          {/* Axes */}
          <path d="M8 32H33" />
          <path d="M8 32V8" />
          {/* Bars */}
          <rect x="12" y="22" width="4" height="10" rx="1" fill="currentColor" fillOpacity="0.2" />
          <rect x="18" y="16" width="4" height="16" rx="1" fill="currentColor" fillOpacity="0.3" />
          <rect x="24" y="11" width="4" height="21" rx="1" fill="currentColor" fillOpacity="0.4" />
          {/* Trendline */}
          <path d="M12 20L18 14L24 16L31 8" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="31" cy="8" r="2" fill={color} />
        </svg>
      );

    case 'Business Development':
      // Neoclassical Archway & Global Enterprise Growth (reminiscent of Card 4 facade)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6">
          {/* Archway building silhouette */}
          <path d="M10 32V16L20 8L30 16V32H10Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M16 32V22C16 19.8 17.8 18 20 18C22.2 18 24 19.8 24 22V32" fill="currentColor" fillOpacity="0.25" />
          {/* Pillars */}
          <line x1="13" y1="18" x2="13" y2="32" strokeWidth="1.2" />
          <line x1="27" y1="18" x2="27" y2="32" strokeWidth="1.2" />
          {/* Growth Star */}
          <path d="M20 4L21 6.5L23.5 7L21.5 8.5L22 11L20 9.5L18 11L18.5 8.5L16.5 7L19 6.5Z" fill={color} stroke="none" />
        </svg>
      );

    case 'UI/UX':
      // Overlapping Bauhaus Geometric Arch & Bezier Pen Node (Card 2 Ruari Edwards match)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6">
          {/* Archway geometry like reference Card 2 */}
          <rect x="10" y="15" width="12" height="17" rx="6" fill="currentColor" fillOpacity="0.2" />
          <path d="M18 10C18 10 24 10 28 14C32 18 32 26 32 32H20V12" />
          {/* Pen tool handle */}
          <circle cx="25" cy="18" r="2" fill={color} />
          <circle cx="15" cy="26" r="2" fill={color} />
          <line x1="15" y1="26" x2="25" y2="18" strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
      );

    case 'DevOps':
      // Infinity Continuous Delivery Loop & Gear Pipeline
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6">
          <path d="M14 26C10.7 26 8 23.3 8 20C8 16.7 10.7 14 14 14C17.5 14 20 20 20 20C20 20 22.5 26 26 26C29.3 26 32 23.3 32 20C32 16.7 29.3 14 26 14C22.5 14 20 20 20 20C20 20 17.5 26 14 26Z" fill="currentColor" fillOpacity="0.1" />
          <circle cx="14" cy="20" r="2.5" fill={color} />
          <circle cx="26" cy="20" r="2.5" fill={color} />
          {/* Deploy arrows */}
          <path d="M11 14L14 11L17 14" strokeWidth="1.3" />
          <path d="M29 26L26 29L23 26" strokeWidth="1.3" />
        </svg>
      );

    case 'QA/Testing':
      // Security Inspection Shield with Checkmark
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6">
          <path d="M20 7L31 11V20C31 26.5 26.3 32.2 20 34C13.7 32.2 9 26.5 9 20V11L20 7Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M15 20.5L18.5 24L25.5 16.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'AR Calling':
      // Telecommunications Headset & Broadcast Waves
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6">
          {/* Headset Band */}
          <path d="M11 22V18C11 13 15 9 20 9C25 9 29 13 29 18V22" />
          <rect x="9" y="20" width="4" height="8" rx="2" fill="currentColor" fillOpacity="0.3" />
          <rect x="27" y="20" width="4" height="8" rx="2" fill="currentColor" fillOpacity="0.3" />
          <path d="M29 25C29 28.5 25.5 31 22 31H21" strokeWidth="1.5" />
          <circle cx="19.5" cy="31" r="1.5" fill={color} />
          {/* Signal Waves */}
          <path d="M5 16C4 18.5 4 21.5 5 24" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M35 16C36 18.5 36 21.5 35 24" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    default: // 'Other' & General
      // 3D Isometric Faceted Cube Cluster (Bunsen Hotel star geometry aesthetic)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round">
          <path d="M20 7L32 14V28L20 35L8 28V14L20 7Z" fill="currentColor" fillOpacity="0.08" />
          <line x1="20" y1="21" x2="32" y2="14" />
          <line x1="20" y1="21" x2="8" y2="14" />
          <line x1="20" y1="21" x2="20" y2="35" />
          {/* Diamond top facet */}
          <polygon points="20,11 26,14.5 20,18 14,14.5" fill="currentColor" fillOpacity="0.25" stroke="none" />
        </svg>
      );
  }
}

// Curated Luxury Keycard Themes inspired directly by Image 1
export const KEYCARD_THEMES = {
  'AI/ML': {
    // Peacock Estate Deep Cobalt / Royal Blue style (Card 3 in reference image)
    themeClass: 'keycard-theme-cobalt',
    code: 'KEY-01',
    categorySubtitle: 'NEURAL PIPELINE',
    bg: 'linear-gradient(135deg, #0f2b5c 0%, #004AAC 100%)',
    textColor: '#ffffff',
    subColor: 'rgba(255, 255, 255, 0.75)',
    logoColor: '#60a5fa',
    borderColor: '#1e40af',
    innerBorderColor: 'rgba(255, 255, 255, 0.22)',
    badgeBg: 'rgba(255, 255, 255, 0.16)',
    badgeText: '#ffffff'
  },
  'Agentic AI': {
    // Deep Amethyst Luxury Keycard
    themeClass: 'keycard-theme-amethyst',
    code: 'KEY-02',
    categorySubtitle: 'AUTONOMOUS CORE',
    bg: 'linear-gradient(135deg, #2e1065 0%, #581c87 100%)',
    textColor: '#ffffff',
    subColor: 'rgba(255, 255, 255, 0.75)',
    logoColor: '#c084fc',
    borderColor: '#6b21a8',
    innerBorderColor: 'rgba(255, 255, 255, 0.22)',
    badgeBg: 'rgba(255, 255, 255, 0.16)',
    badgeText: '#ffffff'
  },
  'Full Stack': {
    // Brushed Platinum / Titanium Silver Keycard (Card 1 Bunsen Hotel style)
    themeClass: 'keycard-theme-silver',
    code: 'KEY-03',
    categorySubtitle: 'ISOMETRIC STACK',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    textColor: '#0f172a',
    subColor: '#64748b',
    logoColor: '#0e7490',
    borderColor: '#cbd5e1',
    innerBorderColor: 'rgba(15, 23, 42, 0.08)',
    badgeBg: '#ffffff',
    badgeText: '#0f172a'
  },
  'Frontend': {
    // Warm Sandstone / Amber Luxury Keycard
    themeClass: 'keycard-theme-sandstone',
    code: 'KEY-04',
    categorySubtitle: 'INTERFACE ARCH',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    textColor: '#78350f',
    subColor: '#92400e',
    logoColor: '#d97706',
    borderColor: '#fde68a',
    innerBorderColor: 'rgba(180, 83, 9, 0.12)',
    badgeBg: '#ffffff',
    badgeText: '#78350f'
  },
  'Backend': {
    // Emerald Mineral Luxury Keycard
    themeClass: 'keycard-theme-emerald',
    code: 'KEY-05',
    categorySubtitle: 'SERVER CLUSTER',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    textColor: '#14532d',
    subColor: '#166534',
    logoColor: '#059669',
    borderColor: '#bbf7d0',
    innerBorderColor: 'rgba(21, 128, 61, 0.12)',
    badgeBg: '#ffffff',
    badgeText: '#14532d'
  },
  'Data Analyst': {
    // Marine Cyan Keycard
    themeClass: 'keycard-theme-marine',
    code: 'KEY-06',
    categorySubtitle: 'TELEMETRY DATA',
    bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
    textColor: '#134e4a',
    subColor: '#115e59',
    logoColor: '#0d9488',
    borderColor: '#99f6e4',
    innerBorderColor: 'rgba(15, 118, 110, 0.12)',
    badgeBg: '#ffffff',
    badgeText: '#134e4a'
  },
  'Business Development': {
    // Rose Gold / Burgundy Keycard
    themeClass: 'keycard-theme-rose',
    code: 'KEY-07',
    categorySubtitle: 'ENTERPRISE DEAL',
    bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    textColor: '#881337',
    subColor: '#9f1239',
    logoColor: '#e11d48',
    borderColor: '#fecdd3',
    innerBorderColor: 'rgba(190, 18, 60, 0.12)',
    badgeBg: '#ffffff',
    badgeText: '#881337'
  },
  'UI/UX': {
    // Minimalist Ruari Edwards Brutalist Slate (Card 2 in reference image)
    themeClass: 'keycard-theme-brutalist',
    code: 'KEY-08',
    categorySubtitle: 'BAUHAUS SYSTEM',
    bg: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
    textColor: '#701a75',
    subColor: '#86198f',
    logoColor: '#c026d3',
    borderColor: '#f5d0fe',
    innerBorderColor: 'rgba(162, 28, 175, 0.12)',
    badgeBg: '#ffffff',
    badgeText: '#701a75'
  },
  'DevOps': {
    // Industrial Slate (Card 4 Nicolas Raskin style)
    themeClass: 'keycard-theme-slate',
    code: 'KEY-09',
    categorySubtitle: 'PIPELINE INFRA',
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    textColor: '#1e3a8a',
    subColor: '#1e40af',
    logoColor: '#2563eb',
    borderColor: '#bfdbfe',
    innerBorderColor: 'rgba(29, 78, 216, 0.12)',
    badgeBg: '#ffffff',
    badgeText: '#1e3a8a'
  },
  'QA/Testing': {
    // Royal Orchid Keycard
    themeClass: 'keycard-theme-orchid',
    code: 'KEY-10',
    categorySubtitle: 'SECURITY SHIELD',
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    textColor: '#831843',
    subColor: '#9d174d',
    logoColor: '#db2777',
    borderColor: '#fbcfe8',
    innerBorderColor: 'rgba(190, 24, 93, 0.12)',
    badgeBg: '#ffffff',
    badgeText: '#831843'
  },
  'AR Calling': {
    // Terracotta Bronze Keycard
    themeClass: 'keycard-theme-terracotta',
    code: 'KEY-11',
    categorySubtitle: 'VOICE COMMS',
    bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    textColor: '#7c2d12',
    subColor: '#9a3412',
    logoColor: '#ea580c',
    borderColor: '#fed7aa',
    innerBorderColor: 'rgba(194, 65, 12, 0.12)',
    badgeBg: '#ffffff',
    badgeText: '#7c2d12'
  },
  'Other': {
    // Brushed Titanium Monochrome Keycard
    themeClass: 'keycard-theme-titanium',
    code: 'KEY-12',
    categorySubtitle: 'POLYHEDRAL ASSET',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    textColor: '#1e293b',
    subColor: '#475569',
    logoColor: '#64748b',
    borderColor: '#e2e8f0',
    innerBorderColor: 'rgba(30, 41, 59, 0.10)',
    badgeBg: '#ffffff',
    badgeText: '#1e293b'
  }
};

export default function DomainKeycard({ category, count, onClick }) {
  const theme = KEYCARD_THEMES[category] || KEYCARD_THEMES['Other'];

  return (
    <div
      className={`keycard-domain-card ${theme.themeClass}`}
      onClick={onClick}
      style={{
        background: theme.bg,
        borderColor: theme.borderColor,
        color: theme.textColor
      }}
      title={`Click to filter ${count.toLocaleString()} candidates in ${category}`}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Inner Decorative Inset Border (Direct match to reference image cards 2 & 4) */}
      <div
        className="keycard-inner-frame"
        style={{ borderColor: theme.innerBorderColor }}
      >
        {/* Top Header: RFID Contactless Wave + Candidate Count Badge */}
        <div className="keycard-top-row">
          <div className="keycard-rfid-chip" style={{ color: theme.logoColor }}>
            <RfidWaves size={13} />
            <span className="keycard-code">{theme.code}</span>
          </div>
          <span
            className="keycard-count-badge"
            style={{
              background: theme.badgeBg,
              color: theme.badgeText
            }}
          >
            {count.toLocaleString()}
          </span>
        </div>

        {/* Center Graphic Emblem (Generated Category-Specific Logo) */}
        <div className="keycard-emblem-center" style={{ color: theme.logoColor }}>
          <CategoryLogo category={category} size={28} color={theme.logoColor} />
        </div>

        {/* Bottom Title & Subtitle */}
        <div className="keycard-bottom-row">
          <div className="keycard-title-group">
            <h4 className="keycard-category-name" style={{ color: theme.textColor }}>
              {category}
            </h4>
            <span className="keycard-category-sub" style={{ color: theme.subColor }}>
              {theme.categorySubtitle}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
