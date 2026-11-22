import React from 'react';
import UserMenu from './UserMenu.jsx';

export default function Header({ user, onLogout, theme, toggleTheme, openMenu }) {
  return <header className="topbar">
    <div className="top-left">
      <button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={openMenu}>☰</button>
    </div>
    <div className="top-actions">
      <button className="icon-btn" aria-label="Toggle dark theme" aria-pressed={theme === 'dark'} title="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? '☀' : '☾'}</button>
      <UserMenu user={user} onLogout={onLogout} />
    </div>
  </header>;
}
