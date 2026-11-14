import { pageHeader } from '../components/page.js';
import { testEndpoint } from '../services/settingsService.js';
import { escapeHtml } from '../utils/formatting.js';

export function renderSettings(container, context) {
  container.innerHTML = `${pageHeader('Settings', 'Personalize your experience and manage data connections.')}
    <section class="card settings-card"><h2>Data Connection</h2>
      <p class="muted">Demo mode stores changes only in this browser. For shared data across devices, enter your MockAPI endpoint URL.</p>
      <form id="connection-form" novalidate><div class="form-group endpoint-field">
        <label for="api-endpoint">Student API Endpoint</label>
        <input id="api-endpoint" class="field" type="url" placeholder="https://YOUR-PROJECT.mockapi.io/api/v1/students" value="${escapeHtml(context.endpoint)}" aria-describedby="endpoint-hint">
        <small class="hint" id="endpoint-hint">The resource must support GET, POST, PUT and DELETE. Use an HTTPS URL without API secrets or query parameters.</small>
      </div><div class="quick-actions"><button class="btn" type="submit">Save API Endpoint</button>
        <button class="btn secondary" type="button" id="demo-mode">Switch to Demo Mode</button>
        <button class="btn secondary" type="button" id="test-api">Test Connection</button>
      </div><p class="connection-result" id="connection-result" role="status"></p></form>
      <div class="notice">Current data source: <b>${context.endpoint ? 'Remote API' : 'Demo data saved in localStorage'}</b>.
        Changing sources does not transfer data automatically.</div>
    </section><section class="card settings-card section-spacing"><h2>Appearance & Demo Data</h2>
      <div class="settings-list"><div class="setting-item"><div><h3>Dark Mode</h3>
        <p>Switch between light and dark themes.</p></div><button class="btn secondary" id="toggle-theme">Toggle Theme</button></div>
        <div class="setting-item"><div><h3>Reset Sample Students</h3>
          <p>Restores 64 sample students in your browser. Does not affect remote API records.</p></div>
          <button class="btn secondary" id="reset-demo">Reset Demo Data</button></div>
      </div></section>`;
  const form = container.querySelector('#connection-form');
  const input = container.querySelector('#api-endpoint');
  const result = container.querySelector('#connection-result');
  let busy = false;

  async function runConnectionAction(action) {
    if (busy) return;
    busy = true;
    form.querySelectorAll('button, input').forEach((control) => { control.disabled = true; });
    result.textContent = 'Checking connection…';
    try {
      await action();
    } catch (error) {
      result.textContent = error.message;
      context.notify(error.message, 'error');
    } finally {
      busy = false;
      form.querySelectorAll('button, input').forEach((control) => { control.disabled = false; });
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runConnectionAction(async () => {
      await context.changeEndpoint(input.value);
      context.notify(input.value.trim() ? 'Remote API connected' : 'Demo mode enabled');
    });
  }, { signal: context.signal });
  container.querySelector('#demo-mode').addEventListener('click', () => runConnectionAction(async () => {
    await context.changeEndpoint('');
    context.notify('Demo mode enabled');
  }), { signal: context.signal });
  container.querySelector('#test-api').addEventListener('click', () => runConnectionAction(async () => {
    const students = await testEndpoint(input.value);
    result.textContent = `Connection successful: ${students.length} records found.`;
  }), { signal: context.signal });
  container.querySelector('#toggle-theme').addEventListener('click', context.toggleTheme, { signal: context.signal });
  container.querySelector('#reset-demo').addEventListener('click', () => context.modal.confirm({
    title: 'Reset demo data?',
    description: 'This replaces student records saved in this browser with 64 fictional samples. Remote records are not affected.',
    confirmLabel: 'Reset Demo Data',
    onConfirm: context.resetDemo,
  }), { signal: context.signal });
}
