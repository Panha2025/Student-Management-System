import { escapeHtml } from '../utils/formatting.js';

export function createModal(dialog, notify) {
  let previousFocus;
  let busy = false;

  function close() {
    if (!dialog.open) return;
    dialog.close();
    if (previousFocus?.isConnected) previousFocus.focus();
    busy = false;
  }

  function open(title, content) {
    close();
    previousFocus = document.activeElement;
    dialog.innerHTML = `<div class="modal-heading">
      <h2 id="modal-title">${escapeHtml(title)}</h2>
      <button type="button" class="icon-btn" data-close aria-label="Close dialog">×</button>
    </div>${content}`;
    dialog.showModal();
  }

  dialog.addEventListener('click', (event) => {
    if (!busy && (event.target.closest('[data-close]') || event.target === dialog)) close();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    if (!busy) close();
  });

  function confirm({ title, description, confirmLabel, onConfirm }) {
    open(title, `<p>${description}</p><div class="modal-actions">
      <button class="btn secondary" data-close autofocus>Cancel</button>
      <button class="btn danger" id="confirm-action">${escapeHtml(confirmLabel)}</button>
    </div>`);
    const button = dialog.querySelector('#confirm-action');
    button.addEventListener('click', async () => {
      busy = true;
      dialog.querySelectorAll('button').forEach((control) => { control.disabled = true; });
      button.textContent = 'Working…';
      try {
        await onConfirm();
        close();
      } catch (error) {
        notify(error.message, 'error');
      } finally {
        busy = false;
        dialog.querySelectorAll('button').forEach((control) => { control.disabled = false; });
        button.textContent = confirmLabel;
      }
    });
  }

  return { open, close, confirm };
}
