import React from 'react';
const TOPICS = [
  ['Dashboard', 'Review student totals, statuses, academic trends, and recently added records.'],
  ['Student directory', 'Search names, student IDs, or emails. Filter by major, year, and status; sort results; open profiles; edit or delete records.'],
  ['Add or edit a student', 'Complete each field. Student IDs must be unique, and GPA must be between 0.00 and 4.00.'],
  ['Analytics and export', 'Charts use the current student records. Export CSV from the directory, or print the analytics page.'],
  ['Data modes', 'API Mode uses the shared MockAPI database by default. You can switch to Demo Mode in Settings; demo students stay in this browser.'],
];
export default function Help() { return <><div className="page-header"><div><h1>Help & Guide</h1><p>Quick guide to managing student records.</p></div></div>
  <section className="card help-card"><div className="settings-list">{TOPICS.map(([title, text]) => <div className="setting-item" key={title}><div><h3>{title}</h3><p>{text}</p></div></div>)}</div>
    <div className="notice">This is an academic project demo, not an official AUPP service. The public MockAPI endpoint has no authentication; anyone who knows the URL may read or modify shared records. Use fictional data only.</div>
  </section></>; }
