import { escapeHtml } from '../utils/formatting.js';

export function pageHeader(title, subtitle, actions = '') {
  return `<div class="page-header">
    <div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>
    ${actions}
  </div>`;
}

export function addStudentLink() {
  return '<a href="#add" class="btn">＋ Add New Student</a>';
}

export function selectOptions(values, selected = '', placeholder = '') {
  const options = [...new Set(values)].filter(Boolean);
  return `${placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : ''}${options.map((value) => (
    `<option value="${escapeHtml(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${escapeHtml(value)}</option>`
  )).join('')}`;
}

export function statusBadge(status) {
  const classes = new Map([['Active', 'active'], ['Inactive', 'inactive'], ['Graduated', 'graduated']]);
  const className = classes.get(status) || 'unknown';
  return `<span class="badge ${className}">${escapeHtml(status || 'Not set')}</span>`;
}
