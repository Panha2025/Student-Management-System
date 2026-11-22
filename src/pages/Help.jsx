import React from 'react';

const TOPICS = [
  ['Manage students', 'Use All Students to search, filter, sort, view a profile, edit, delete, or export records. Add Student opens the validated student form.'],
  ['View reports', 'Dashboard and Analytics show current totals and charts. Analytics can be printed.'],
  ['Choose a data mode', 'API Mode shares MockAPI records. Demo Mode uses this browser’s 64 fictional sample students. Settings can switch modes or test the read connection.'],
];

export default function Help() {
  return <><div className="page-header"><div><h1>Help & Guide</h1></div></div>
    <section className="card help-card"><div className="settings-list">{TOPICS.map(([title, text]) => <div className="setting-item" key={title}><div><h3>{title}</h3><p>{text}</p></div></div>)}</div>
      <div className="notice">This is a student project, not an official AUPP service. Google sign-in protects the website interface only. The public MockAPI endpoint has no authentication or authorization; anyone with its URL may read or change records. Use fictional data only.</div>
    </section></>;
}
