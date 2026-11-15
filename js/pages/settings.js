import { pageHeader } from '../components/page.js';
import { STUDENTS_ENDPOINT } from '../api/studentsApi.js';
import { testEndpoint } from '../services/settingsService.js';
import { escapeHtml } from '../utils/formatting.js';

export function renderSettings(container, context) {
  container.innerHTML = `${pageHeader('Settings', 'Personalize your experience and manage data connections.')}
    <section class="card settings-card"><h2>Data Connection</h2>
      <p class="muted">Student records connect to the shared class database automatically. Demo Mode keeps its 64 fictional sample records in this browser.</p>
      <p class="hint">Shared MockAPI endpoint: <code>${escapeHtml(STUDENTS_ENDPOINT)}</code></p>
      <div class="quick-actions" id="connection-controls">
        <button class="btn" type="button" id="api-mode">Connect to Shared MockAPI</button>
        <button class="btn secondary" type="button" id="demo-mode">Switch to Demo Mode</button>
        <button class="btn secondary" type="button" id="test-api">Test Connection</button>
      </div><p class="connection-result" id="connection-result" role="status" aria-live="polite"></p>
      <div class="notice">Current data source: <b>${context.endpoint ? 'Shared MockAPI' : 'Demo data saved in this browser'}</b>. The public database has no sign-in or access control. Anyone who knows this endpoint may read or modify its records. Use fictional data only. Switching modes never copies demo records to MockAPI.</div>
    </section><section class="card settings-card section-spacing"><h2>Appearance & Demo Data</h2>
      <div class="settings-list"><div class="setting-item"><div><h3>Dark Mode</h3>
        <p>Switch between light and dark themes.</p></div><button class="btn secondary" id="toggle-theme">Toggle Theme</button></div>
        <div class="setting-item"><div><h3>Reset Sample Students</h3>
          <p>Restores 64 sample students in your browser. Does not affect remote API records.</p></div>
          <button class="btn secondary" id="reset-demo">Reset Demo Data</button></div>
      </div></section>`;
  const controls = container.querySelector('#connection-controls');
  const result = container.querySelector('#connection-result');
  let busy = false;

  async function runConnectionAction(action) {
    if (busy) return;
    busy = true;
    controls.querySelectorAll('button').forEach((control) => { control.disabled = true; });
    result.textContent = 'Checking connection…';
    try {
      await action();
    } catch (error) {
      result.textContent = error.message;
      context.notify(error.message, 'error');
    } finally {
      busy = false;
      controls.querySelectorAll('button').forEach((control) => { control.disabled = false; });
    }
  }

  container.querySelector('#api-mode').addEventListener('click', () => runConnectionAction(async () => {
    const students = await context.changeEndpoint(STUDENTS_ENDPOINT);
    result.textContent = `Connected to the shared database: ${students.length} records found.`;
    context.notify('Shared MockAPI connected');
  }), { signal: context.signal });
  container.querySelector('#demo-mode').addEventListener('click', () => runConnectionAction(async () => {
    await context.changeEndpoint('');
    result.textContent = 'Demo Mode enabled. Shared records were not changed.';
    context.notify('Demo mode enabled');
  }), { signal: context.signal });
  container.querySelector('#test-api').addEventListener('click', () => runConnectionAction(async () => {
    const students = await testEndpoint(STUDENTS_ENDPOINT);
    result.textContent = `Shared MockAPI is reachable: ${students.length} records found.`;
  }), { signal: context.signal });
  container.querySelector('#toggle-theme').addEventListener('click', context.toggleTheme, { signal: context.signal });
  container.querySelector('#reset-demo').addEventListener('click', () => context.modal.confirm({
    title: 'Reset demo data?',
    description: 'This replaces student records saved in this browser with 64 fictional samples. Remote records are not affected.',
    confirmLabel: 'Reset Demo Data',
    onConfirm: context.resetDemo,
  }), { signal: context.signal });
}
