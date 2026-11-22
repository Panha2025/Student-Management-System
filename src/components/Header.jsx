import React from 'react';
import { formatDate } from '../utils/formatting.js';
const TITLES = { dashboard: 'Dashboard', students: 'All Students', add: 'Add Student', edit: 'Edit Student', analytics: 'Analytics', settings: 'Settings', help: 'Help & Guide' };
export default function Header({ page, theme, toggleTheme, openMenu }) {
  return <header className="topbar">
    <div className="top-left">
      <button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={openMenu}>☰</button>
      <div className="breadcrumbs"><span>AUPP</span><span aria-hidden="true">/</span><strong>{TITLES[page] || 'Dashboard'}</strong></div>
    </div>
    <div className="top-actions">
      <span className="date-pill">{formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
      <button className="icon-btn" aria-label="Toggle dark theme" aria-pressed={theme === 'dark'} onClick={toggleTheme}>{theme === 'dark' ? '☀' : '☾'}</button>
    </div>
  </header>;
}
