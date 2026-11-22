import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseAuthService } from '../services/firebase.js';
import { getAuthErrorMessage } from '../utils/authMessages.js';

const AuthContext = createContext(null);

export function AuthProvider({ children, service = firebaseAuthService }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!service.configured) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    return service.subscribe(
      (nextUser) => { setUser(nextUser); setAuthError(''); setLoading(false); },
      (error) => { setUser(null); setAuthError(getAuthErrorMessage(error)); setLoading(false); },
    );
  }, [service]);

  const value = useMemo(() => ({
    user,
    loading,
    configured: service.configured,
    authError,
    async signIn() {
      setAuthError('');
      try { await service.signIn(); }
      catch (error) { const message = getAuthErrorMessage(error); setAuthError(message); throw new Error(message); }
    },
    async logout() {
      setAuthError('');
      try { await service.signOut(); }
      catch (error) { const message = getAuthErrorMessage(error); setAuthError(message); throw new Error(message); }
    },
  }), [user, loading, service, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}

export { AuthContext };
