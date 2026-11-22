export function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, (character) => entities[character]);
}

export function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]).join('').toUpperCase();
}

export function formatGpa(value) {
  const number = Number(value);
  return String(value).trim() && Number.isFinite(number) ? number.toFixed(2) : '—';
}

export function formatDate(value, options) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', options);
}
