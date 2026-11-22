import React, { useEffect, useRef, useState } from 'react';

function accountInitials(user) {
  const name = user.displayName || user.email || '?';
  return name.trim().split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    function closeOutside(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  async function logout() {
    setBusy(true);
    setError('');
    try { await onLogout(); }
    catch (logoutError) { setError(logoutError.message); setBusy(false); }
  }

  return <div className="user-menu" ref={menuRef}>
    <button className="user-menu-trigger" aria-label={`Open account menu for ${user.displayName || user.email}`} title={user.email || user.displayName} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      {user.photoURL ? <img src={user.photoURL} alt="" className="user-avatar" referrerPolicy="no-referrer" /> : <span className="user-avatar user-avatar-fallback">{accountInitials(user)}</span>}
      <span className="user-menu-name">{user.displayName || user.email}</span><span className="user-menu-chevron" aria-hidden="true">⌄</span>
    </button>
    {open && <section className="user-menu-popover" aria-label="Account options">
      <div className="user-menu-identity">
        {user.photoURL ? <img src={user.photoURL} alt="" className="user-avatar" referrerPolicy="no-referrer" /> : <span className="user-avatar user-avatar-fallback">{accountInitials(user)}</span>}
        <div><strong>{user.displayName || 'Google account'}</strong><span>{user.email}</span></div>
      </div>
      {error && <p className="user-menu-error" role="alert">{error}</p>}
      <button className="btn secondary user-logout" disabled={busy} onClick={logout}>{busy ? 'Signing out…' : 'Sign out'}</button>
    </section>}
  </div>;
}
