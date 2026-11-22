import React from 'react';

export default function Header({ theme, toggleTheme, openMenu }) {
  return <header className="topbar">
    <div className="top-left">
      <button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={openMenu}>☰</button>
    </div>
    <div className="top-actions">
      <button className="icon-btn" aria-label="Toggle dark theme" aria-pressed={theme === 'dark'} title="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? '☀' : '☾'}</button>
    </div>
  </header>;
}
