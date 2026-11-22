import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService } from '../src/services/authService.js';
import { getAuthErrorMessage } from '../src/utils/authMessages.js';
import { isFirebaseConfigReady } from '../src/utils/firebaseConfig.js';

function mockFirebase() {
  const calls = [];
  let userListener;
  let errorListener;
  const auth = { name: 'mock-auth' };
  const provider = { name: 'google-provider' };
  const service = createAuthService({
    auth,
    provider,
    browserLocalPersistence: 'local-persistence',
    onAuthStateChanged: (currentAuth, onUser, onError) => {
      calls.push(['subscribe', currentAuth]); userListener = onUser; errorListener = onError;
      return () => calls.push(['unsubscribe']);
    },
    setPersistence: async (...args) => calls.push(['persistence', ...args]),
    signInWithPopup: async (...args) => { calls.push(['popup', ...args]); return { user: { email: 'fictional@example.com' } }; },
    signOut: async (...args) => calls.push(['signOut', ...args]),
  });
  return { calls, service, auth, provider, emitUser: (user) => userListener(user), emitError: (error) => errorListener(error) };
}

test('auth service subscribes to Firebase session changes and cleans up its listener', () => {
  const mock = mockFirebase();
  let receivedUser;
  let receivedError;
  const unsubscribe = mock.service.subscribe((user) => { receivedUser = user; }, (error) => { receivedError = error; });
  const user = { email: 'student@example.com' };
  const error = new Error('listener failed');
  mock.emitUser(user);
  mock.emitError(error);
  unsubscribe();
  assert.equal(receivedUser, user);
  assert.equal(receivedError, error);
  assert.deepEqual(mock.calls.map(([name]) => name), ['subscribe', 'unsubscribe']);
});

test('Google sign-in enables persistent browser auth before opening the OAuth popup', async () => {
  const mock = mockFirebase();
  const result = await mock.service.signIn();
  assert.equal(result.user.email, 'fictional@example.com');
  assert.deepEqual(mock.calls.map(([name]) => name), ['persistence', 'popup']);
  assert.equal(mock.calls[0][1], mock.auth);
  assert.equal(mock.calls[0][2], 'local-persistence');
  assert.deepEqual(mock.calls[1].slice(1), [mock.auth, mock.provider]);
  await mock.service.signOut();
  assert.deepEqual(mock.calls.at(-1), ['signOut', mock.auth]);
});

test('an unconfigured Firebase auth service cannot pretend to sign in', async () => {
  const service = createAuthService({ auth: null });
  assert.equal(service.configured, false);
  assert.equal(typeof service.subscribe(() => {}, () => {}), 'function');
  await assert.rejects(service.signIn(), /not configured/);
});

test('Google authentication failures have useful, non-secret messages', () => {
  assert.match(getAuthErrorMessage({ code: 'auth/popup-closed-by-user' }), /canceled/i);
  assert.match(getAuthErrorMessage({ code: 'auth/unauthorized-domain' }), /not authorized/i);
  assert.match(getAuthErrorMessage(new Error('Temporary provider error')), /Temporary provider error/);
});

test('Firebase config rejects missing values and untouched example placeholders', () => {
  assert.equal(isFirebaseConfigReady({ apiKey: '', authDomain: 'project.firebaseapp.com' }), false);
  assert.equal(isFirebaseConfigReady({ apiKey: 'your-firebase-web-api-key', authDomain: 'your-project-id.firebaseapp.com' }), false);
  assert.equal(isFirebaseConfigReady({ apiKey: 'AIzaExampleClientKey', authDomain: 'campusflow.firebaseapp.com', projectId: 'campusflow', appId: '1:123:web:abc' }), true);
});
