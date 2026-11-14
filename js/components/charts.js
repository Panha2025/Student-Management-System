import { escapeHtml } from '../utils/formatting.js';
import { countBy, getStatistics } from '../utils/studentQueries.js';

const COLORS = ['#4c68e9', '#2db99a', '#f1b051', '#b18bea', '#ef809a', '#5bb1d4', '#8d9bb9', '#dc917b'];
const STATUS_COLORS = { Active: '#31b89b', Inactive: '#f3b25a', Graduated: '#987be7' };

function statusColor(status) {
  return Object.hasOwn(STATUS_COLORS, status) ? STATUS_COLORS[status] : '#8d9bb9';
}

export function metricCards(students) {
  const stats = getStatistics(students);
  const metrics = [
    ['Total Students', stats.total, '♙', 'All enrolled records'],
    ['Active Students', stats.active, '◉', 'Currently studying'],
    ['Inactive Students', stats.inactive, '◌', 'Not currently active'],
    ['Average GPA', stats.averageGpa, '▤', 'Across valid student GPAs'],
  ];
  return `<div class="metrics">${metrics.map(([label, value, icon, description]) => `<article class="card metric">
    <div class="metric-top">${label}<span class="metric-icon" aria-hidden="true">${icon}</span></div>
    <div class="metric-value">${value}</div><div class="metric-sub">${description}</div>
  </article>`).join('')}</div>`;
}

export function barChart(entries) {
  if (!entries.length) return '<div class="empty">No data yet</div>';
  const maximum = Math.max(1, ...entries.map(([, count]) => count));
  return `<div class="bar-list">${entries.map(([label, count], index) => `<div class="bar-item">
    <div class="bar-caption"><span>${escapeHtml(label)}</span><b>${count} students</b></div>
    <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${count / maximum * 100}%;background:${COLORS[index % COLORS.length]}"></div></div>
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
