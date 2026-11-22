const AUTH_MESSAGES = {
  'auth/popup-closed-by-user': 'Google sign-in was canceled. You can try again when ready.',
  'auth/cancelled-popup-request': 'Another Google sign-in window is already open. Finish that sign-in or try again.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.',
  'auth/unauthorized-domain': 'This website domain is not authorized in Firebase Authentication settings.',
  'auth/operation-not-allowed': 'Google sign-in is not enabled for this Firebase project.',
  'auth/network-request-failed': 'Could not reach Google Authentication. Check your connection and try again.',
  'auth/invalid-api-key': 'Firebase configuration is invalid. Check the Vercel or local environment settings.',
};

export function getAuthErrorMessage(error) {
  if (AUTH_MESSAGES[error?.code]) return AUTH_MESSAGES[error.code];
  return error?.message || 'Google sign-in failed. Please try again.';
}
