import React, { useState } from 'react';
import { STUDENTS_ENDPOINT } from '../api/studentsApi.js';
export default function Settings({ endpoint, theme, toggleTheme, setMode, testApi, resetDemo, notify, modeBusy, setModeBusy }) {
  const [connectionMessage, setConnectionMessage] = useState('');
  async function run(action) { setModeBusy(true); setConnectionMessage('Checking connection…'); try { setConnectionMessage(await action() || 'Data source updated.'); } catch (error) { setConnectionMessage(error.message); notify(error.message, 'error'); } finally { setModeBusy(false); } }
  return <><div className="page-header"><div><h1>Settings</h1><p>Manage data and appearance.</p></div></div>
    <section className="card settings-card"><h2>Data Connection</h2><p className="muted">API Mode connects to the shared class database. Demo Mode keeps 64 fictional sample records in this browser.</p><p className="hint">Shared endpoint: <code>{STUDENTS_ENDPOINT}</code></p>
      <div className="quick-actions"><button className="btn" disabled={modeBusy} onClick={() => run(async () => { await setMode(STUDENTS_ENDPOINT); return 'Connected to the shared student database.'; })}>Connect to Shared MockAPI</button><button className="btn secondary" disabled={modeBusy} onClick={() => run(async () => { await setMode(''); return 'Demo Mode enabled. Shared records were not changed.'; })}>Switch to Demo Mode</button><button className="btn secondary" disabled={modeBusy} onClick={() => run(async () => { const records = await testApi(); return `MockAPI is reachable: ${records.length} records found.`; })}>Test Connection</button></div>
      <p className="connection-result" role="status" aria-live="polite">{connectionMessage} Current source: <b>{endpoint ? 'Shared MockAPI' : 'Demo data saved in this browser'}</b></p>
      <div className="notice">The public database has no sign-in or access control. Anyone who knows this endpoint may read or modify shared records. Use fictional data only. Switching modes never copies demo records to MockAPI.</div>
    </section>
    <section className="card settings-card section-spacing"><h2>Appearance & Demo Data</h2><div className="settings-list">
      <div className="setting-item"><div><h3>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</h3><p>Switch between light and dark themes.</p></div><button className="btn secondary" onClick={toggleTheme}>Toggle Theme</button></div>
      <div className="setting-item"><div><h3>Reset Sample Students</h3><p>Restores fictional sample records in this browser only.</p></div><button className="btn secondary" onClick={resetDemo}>Reset Demo Data</button></div>
    </div></section>
  </>;
}
