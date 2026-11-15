import { escapeHtml } from '../utils/formatting.js';
import { countBy, getStatistics } from '../utils/studentQueries.js';

const STATUS_COLORS = { Active: '#8bc5ff', Inactive: '#ffb28e', Graduated: '#c6a4f7' };
const BAR_COLORS = ['#8bc5ff', '#9fe7d2', '#ffdc8a', '#c6a4f7', '#f49daf', '#a8c6d8', '#abd1af', '#f0c3a3'];
const METRIC_ICONS = {
  students: '<svg viewBox="0 0 24 24"><path d="M16 20v-1.5a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4V20M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 11a4 4 0 0 0 0-7M17 14.5a4 4 0 0 1 3 3.9V20"/></svg>',
  active: '<svg viewBox="0 0 24 24"><path d="m4 7 8-4 8 4-8 4-8-4ZM6 9.5v5.2c3.7 2.7 8.3 2.7 12 0V9.5M20 7v6"/></svg>',
  inactive: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8v8M14 8v8"/></svg>',
  gpa: '<svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 15v-4M12 15V7M16 15V9M20 15V4"/></svg>',
};

function statusColor(status) {
  return Object.hasOwn(STATUS_COLORS, status) ? STATUS_COLORS[status] : '#8491a5';
}

export function metricCards(students) {
  const stats = getStatistics(students);
  const metrics = [
    ['Total Students', stats.total, 'All enrolled records', 'students', 'coral'],
    ['Active Students', stats.active, 'Currently studying', 'active', 'blue'],
    ['Inactive Students', stats.inactive, 'Not currently active', 'inactive', 'amber'],
    ['Average GPA', stats.averageGpa, 'Across valid student GPAs', 'gpa', 'purple'],
  ];
  return `<div class="metrics">${metrics.map(([label, value, description, icon, color]) => `<article class="card metric">
    <div class="metric-top">${label}<span class="metric-icon ${color}" aria-hidden="true">${METRIC_ICONS[icon]}</span></div>
    <div class="metric-value">${value}</div><div class="metric-sub">${description}</div>
  </article>`).join('')}</div>`;
}

export function barChart(entries) {
  if (!entries.length) return '<div class="empty" role="status"><h3>No students to chart yet</h3><span>Add student records to see this breakdown.</span></div>';
  const maximum = Math.max(1, ...entries.map(([, count]) => count));
  return `<div class="bar-list">${entries.map(([label, count], index) => `<div class="bar-item">
    <div class="bar-caption"><span>${escapeHtml(label)}</span><b>${count} students</b></div>
    <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${count / maximum * 100}%;background:${BAR_COLORS[index % BAR_COLORS.length]}"></div></div>
  </div>`).join('')}</div>`;
}

export function majorChart(students) {
  return barChart(countBy(students, 'major').sort((first, second) => second[1] - first[1]));
}

export function statusChart(students) {
  const counts = new Map(countBy(students, 'status'));
  const entries = [...new Set([...Object.keys(STATUS_COLORS), ...counts.keys()])]
    .map((status) => [status, counts.get(status) || 0]);
  let position = 0;
  const segments = entries.map(([status, count]) => {
    const start = position;
    position += count / Math.max(1, students.length) * 100;
    return `${statusColor(status)} ${start}% ${position}%`;
  });
  const background = students.length ? `conic-gradient(${segments.join(',')})` : 'var(--border)';
  return `<div class="donut-layout"><div class="donut" style="background:${background}" aria-hidden="true">
    <div class="donut-center"><div><b>${students.length}</b><small>Students</small></div></div>
    </div><div class="donut-legend">${entries.map(([status, count]) => `<div>
      <i class="legend-dot" style="background:${statusColor(status)}" aria-hidden="true"></i>
      ${escapeHtml(status)} <strong>${count}</strong></div>`).join('')}</div></div>`;
}
