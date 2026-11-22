export function createAuthService({
  auth,
  provider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
}) {
  return {
    configured: Boolean(auth),
    subscribe(onUser, onError) {
      if (!auth) return () => {};
      return onAuthStateChanged(auth, onUser, onError);
    },
    async signIn() {
      if (!auth) throw new Error('Google sign-in is not configured yet.');
      await setPersistence(auth, browserLocalPersistence);
      return signInWithPopup(auth, provider);
    },
    async signOut() {
      if (!auth) return;
      return signOut(auth);
    },
  };
}
