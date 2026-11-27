export function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]).join('').toUpperCase();
}

export function formatGpa(value) {
  const text = String(value ?? '').trim();
  const number = Number(text);
  return text && Number.isFinite(number) ? number.toFixed(2) : '—';
}
