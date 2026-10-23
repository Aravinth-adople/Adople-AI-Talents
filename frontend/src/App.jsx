import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import CandidatesPage from './pages/CandidatesPage';
import UploadPage from './pages/UploadPage';
import { fetchStats } from './services/api';

export default function App() {
  const [stats, setStats] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  // Fetch Stats on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load global stats', err);
      }
    }
    load();
  }, []);

  const totalResumes = stats?.total_resumes || 3159;

  return (
    <BrowserRouter>
      <div className="light-theme app-root">
        {/* Global Multi-Page Navigation Bar (Clean & Uncluttered) */}
        <Navbar totalResumes={totalResumes} />

        {/* Multi-Page Routes */}
        <div className="app-page-wrapper">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/candidates" element={<CandidatesPage showToast={showToast} />} />
            <Route path="/upload" element={<UploadPage showToast={showToast} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Global Feedback Toasts */}
        <Toast toasts={toasts} />
      </div>
    </BrowserRouter>
  );
}
