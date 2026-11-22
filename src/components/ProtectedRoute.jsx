import React from 'react';
import Login from '../pages/Login.jsx';

export default function ProtectedRoute({ loading, user, children }) {
  if (loading) return <main className="auth-checking" role="status" aria-live="polite"><div className="auth-spinner" aria-hidden="true" /><p>Checking your sign-in…</p></main>;
  if (!user) return <Login />;
  return children;
}
