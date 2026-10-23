import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, UploadCloud } from 'lucide-react';
import adopleLogo from '../assets/adople-ai-logo.png';
import { ADOPLE_LOGO_B64 } from '../assets/logoData';

export default function Navbar({ totalResumes = 3159 }) {
  const [imgSrc, setImgSrc] = useState(adopleLogo || ADOPLE_LOGO_B64);

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="brand" title="Adople AI Talents">
          <div className="brand-logo-wrapper">
            <img
              src={imgSrc}
              onError={() => setImgSrc(ADOPLE_LOGO_B64)}
              alt="Adople AI"
              className="brand-adople-logo"
            />
            <div className="brand-talents-group">
              <span className="brand-talents-label">Talents</span>
              <span className="brand-talents-sub">Recruitment Platform</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Folder Tabs styled exactly like reference image */}
      <nav className="folder-nav-tabs" aria-label="Main Navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `folder-nav-tab ${isActive ? 'active' : ''}`}
        >
          <span>dashboard</span>
        </NavLink>

        <NavLink
          to="/candidates"
          className={({ isActive }) => `folder-nav-tab ${isActive ? 'active' : ''}`}
        >
          <span>candidates</span>
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) => `folder-nav-tab ${isActive ? 'active' : ''}`}
        >
          <span>upload</span>
        </NavLink>
      </nav>
    </header>
  );
}
