import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import Header from './components/Header.jsx';
import StudentForm from './components/StudentForm.jsx';
import StudentTable from './components/StudentTable.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';
import Help from './pages/Help.jsx';
import { fetchCountries } from './api/countriesApi.js';
import { STUDENTS_ENDPOINT } from './api/studentsApi.js';
import { deleteStudent, getEndpoint, listStudents, saveStudent, resetSampleStudents } from './services/studentService.js';
import { connectEndpoint, testEndpoint } from './services/settingsService.js';
import { readSetting, STORAGE_KEYS, writeSetting } from './services/storageService.js';
import { parseRoute } from './router.js';

function getRoute() { return parseRoute(window.location.hash); }

function CampusFlow({ user }) {
  const [route, setRoute] = useState(getRoute);
  const [students, setStudents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [endpoint, setEndpoint] = useState(() => getEndpoint());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [theme, setTheme] = useState(() => readSetting(STORAGE_KEYS.theme, 'light'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [modeBusy, setModeBusy] = useState(false);

  const { logout } = useAuth();
  const notify = (message, type = 'success') => setToast({ message, type, key: Date.now() + Math.random() });
  const refreshStudents = async () => {
    setLoading(true);
    setLoadError('');
    try { setStudents(await listStudents()); return true; }
    catch (error) { setLoadError(error.message || 'Could not load student records.'); return false; }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => { refreshStudents(); }, []);
  useEffect(() => {
    let mounted = true;
    fetchCountries({ onUnavailable: () => { if (mounted) notify('Country service unavailable. Offline country options are ready.', 'error'); } })
      .then((list) => { if (mounted) setCountries(list); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    try { writeSetting(STORAGE_KEYS.theme, theme); } catch (error) { notify(error.message, 'error'); }
  }, [theme]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const actions = useMemo(() => ({
    onProfile: (student) => setDialog({ type: 'profile', student }),
    onEdit: (student) => { window.location.hash = `edit/${encodeURIComponent(student.id)}`; },
    onDelete: (student) => setDialog({ type: 'delete', student }),
  }), []);

  async function handleSave(input, id = null) {
    try {
      const saved = await saveStudent(input, { id, students });
      setStudents((current) => id ? current.map((record) => record.id === id ? saved : record) : [saved, ...current]);
      notify(id ? 'Student updated successfully' : 'Student added successfully');
      window.location.hash = 'students';
    } catch (error) {
      notify(`Could not save: ${error.message}`, 'error');
      throw error;
    }
  }

  async function confirmDialog() {
    if (dialog?.type === 'delete') {
      try {
        await deleteStudent(dialog.student.id);
        setStudents((current) => current.filter((record) => record.id !== dialog.student.id));
        notify('Student deleted successfully');
      } catch (error) { notify(`Could not delete: ${error.message}`, 'error'); }
    }
    if (dialog?.type === 'reset') {
      try {
        const demo = resetSampleStudents();
        await connectEndpoint('');
        setEndpoint(''); setStudents(demo); setLoadError('');
        notify('Demo data reset to 64 fictional students');
      } catch (error) { notify(error.message, 'error'); }
    }
    setDialog(null);
  }

  async function changeMode(url) {
    const remoteRecords = await connectEndpoint(url);
    const activeEndpoint = url ? STUDENTS_ENDPOINT : '';
    setEndpoint(activeEndpoint);
    setStudents(remoteRecords ?? await listStudents());
    setLoadError('');
    setRoute({ name: 'settings', id: null });
    notify(activeEndpoint ? 'Shared MockAPI connected' : 'Demo Mode enabled');
  }

  const editingStudent = route.name === 'edit' ? students.find((student) => student.id === route.id) : null;
  let content;
  if (loading) content = <section className="card loading-state" role="status"><h1>Loading student records…</h1><p>Connecting to {endpoint ? 'the shared student database' : 'Demo Mode'}.</p></section>;
  else if (loadError) content = <section className="card error-state" role="alert"><h1>Student records could not be loaded</h1><p>{loadError}</p><p>Your selected data source is unchanged. The application did not switch to Demo Mode.</p><div className="quick-actions"><button className="btn" onClick={refreshStudents}>Retry</button><a className="btn secondary" href="#settings">Open Settings</a><button className="btn secondary" onClick={() => changeMode('')}>Use Demo Mode</button></div></section>;
  else switch (route.name) {
    case 'students': content = <Students students={students} actions={actions} notify={notify} />; break;
    case 'add': content = <><div className="page-header"><div><h1>Add Student</h1><p>Register a student record.</p></div><a className="btn secondary" href="#students">← Back to Students</a></div><StudentForm students={students} countries={countries} onSave={(input) => handleSave(input)} onCancel={() => { window.location.hash = 'students'; }} /></>; break;
    case 'edit': content = editingStudent ? <><div className="page-header"><div><h1>Edit Student</h1><p>Update this student record.</p></div><a className="btn secondary" href="#students">← Back to Students</a></div><StudentForm key={editingStudent.id} student={editingStudent} students={students} countries={countries} onSave={(input) => handleSave(input, editingStudent.id)} onCancel={() => { window.location.hash = 'students'; }} /></> : <section className="card"><h1>Student not found</h1><a className="btn" href="#students">Back to Students</a></section>; break;
    case 'analytics': content = <Analytics students={students} />; break;
    case 'settings': content = <Settings endpoint={endpoint} theme={theme} toggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} setMode={changeMode} testApi={() => testEndpoint(STUDENTS_ENDPOINT)} resetDemo={() => setDialog({ type: 'reset' })} notify={notify} modeBusy={modeBusy} setModeBusy={setModeBusy} />; break;
    case 'help': content = <Help />; break;
    default: content = <Dashboard students={students} actions={actions} />;
  }

  return <>
    <a href="#content" className="skip-link">Skip to content</a>
    <Sidebar page={route.name} navigate={(page) => { if (page !== route.name) window.location.hash = page; }} open={menuOpen} close={() => setMenuOpen(false)} />
    <div className="main-wrap"><Header user={user} onLogout={logout} theme={theme} toggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} openMenu={() => setMenuOpen(true)} />
      <main id="content" tabIndex="-1">{content}</main>
      <footer className="footer">AUPP Student Management System • Academic project demo, not an official AUPP service<span>Web Development II</span></footer>
    </div>
    {dialog?.type === 'delete' && <ConfirmDialog title="Delete student?" message={`Delete ${dialog.student.name}? This action removes the record from the currently selected data source.`} confirmLabel="Delete Student" onConfirm={confirmDialog} onCancel={() => setDialog(null)} />}
    {dialog?.type === 'reset' && <ConfirmDialog title="Reset demo data?" message="This replaces student records saved in this browser with 64 fictional samples. It never deletes remote records." confirmLabel="Reset Demo Data" onConfirm={confirmDialog} onCancel={() => setDialog(null)} />}
    {dialog?.type === 'profile' && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}><section className="card confirm-dialog profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-name"><div className="modal-heading"><h2 id="profile-name">Student Profile</h2><button className="action" onClick={() => setDialog(null)} aria-label="Close profile">×</button></div><div className="profile-heading"><span className="initials profile-initials">{dialog.student.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><div><h3>{dialog.student.name}</h3><span className="muted">{dialog.student.studentId}</span></div></div><div className="details-grid">{[['Email', dialog.student.email], ['Major', dialog.student.major], ['Academic year', dialog.student.year], ['GPA', dialog.student.gpa], ['Country', dialog.student.country], ['Status', dialog.student.status]].map(([label, value]) => <div key={label}><span className="detail-label">{label}</span><p className="detail-value">{value}</p></div>)}</div><div className="modal-actions"><button className="btn secondary" onClick={() => setDialog(null)}>Close</button><button className="btn" onClick={() => { const student = dialog.student; setDialog(null); actions.onEdit(student); }}>Edit Student</button></div></section></div>}
    {toast && <div id="toasts" role="status" aria-live="polite"><div key={toast.key} className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>{toast.message}</div></div>}
    <noscript><div className="noscript-notice">This student management demo needs JavaScript. Enable it and reload this page.</div></noscript>
  </>;
}

export default function App() {
  const { user, loading } = useAuth();
  return <ProtectedRoute loading={loading} user={user}><CampusFlow user={user} /></ProtectedRoute>;
}
