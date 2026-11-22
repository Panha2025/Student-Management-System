import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.5 9.5 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"/><path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8A19.3 19.3 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"/></svg>;
}

export default function Login() {
  const { configured, authError, signIn } = useAuth();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleSignIn() {
    if (busy || !configured) return;
    setBusy(true);
    setError('');
    try { await signIn(); }
    catch (signInError) { setError(signInError.message); }
    finally { setBusy(false); }
  }

  return <main className="login-page">
    <section className="login-photo" aria-label="American University of Phnom Penh campus">
      <div className="login-photo-shade" />
      <div className="login-campus-label"><img src="/images/aupp-logo.png" alt="AUPP" /><span>American University<br />of Phnom Penh</span></div>
      <p className="login-photo-caption">AUPP Student Management System</p>
    </section>
    <section className="login-panel">
      <div className="login-card">
        <img className="login-logo" src="/images/aupp-logo.png" alt="American University of Phnom Penh" />
        <p className="login-eyebrow">AUPP · INFO 251</p>
        <h1>Student Management System</h1>
        <p className="login-subtitle">Sign in to continue.</p>
        {(error || authError) && <div className="login-error" role="alert">{error || authError}</div>}
        {!configured && <div className="login-setup" role="status"><strong>Firebase setup required</strong><span>Google sign-in is unavailable until Firebase is configured. See <code>.env.example</code> and the README setup steps.</span></div>}
        <button className="google-signin" type="button" disabled={busy || !configured} onClick={handleSignIn}>
          <GoogleMark />{busy ? 'Opening Google…' : 'Continue with Google'}
        </button>
        <p className="login-disclaimer">Academic project demonstration only. This is not an official AUPP service. Use fictional student data.</p>
      </div>
      <span className="login-footer">CampusFlow · Web Development II</span>
    </section>
  </main>;
}
