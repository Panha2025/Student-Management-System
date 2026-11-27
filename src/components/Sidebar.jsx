import React from 'react';
const links = [
  ['dashboard', 'Dashboard', '▦'],
  ['students', 'All Students', '♙'],
  ['add', 'Add Student', '＋'],
  ['analytics', 'Analytics', '▥'],
  ['settings', 'Settings', '⚙'],
  ['help', 'Help & Guide', '?'],
];

export default function Sidebar({ page, open, close }) {
  return <>
    {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={close} />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <a className="brand" href="#dashboard" onClick={close}>
        <img className="brand-logo" src="/images/aupp-logo.png" alt="American University of Phnom Penh" width="120" height="171" />
        <span className="brand-subtitle">Student Management<br />System</span>
      </a>
      <nav aria-label="Main navigation">
        {links.map(([route, label, icon], index) => <span key={route}>
          {index === 4 && <span className="nav-divider" />}
          <a className={`nav-link ${page === route || (route === 'students' && page === 'edit') ? 'active' : ''}`}
            href={`#${route}`} onClick={close}>
            <span className="nav-symbol" aria-hidden="true">{icon}</span>{label}
          </a>
        </span>)}
      </nav>
    </aside>
  </>;
}
