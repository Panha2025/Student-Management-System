import React from 'react';
import { countBy } from '../utils/studentQueries.js';

const COLORS = ['#8bc5ff', '#9de4d4', '#ffd982', '#cda5f8', '#ff9eae', '#8fd1a0', '#f3b18d', '#aab4c9'];
export function MajorChart({ students }) {
  const majors = countBy(students, 'major').sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(1, ...majors.map(([, count]) => count));
  return <div className="bar-list">{majors.length ? majors.map(([major, count], index) => <div className="bar-item" key={major}>
    <div className="bar-caption"><span>{major}</span><b>{count} student{count === 1 ? '' : 's'}</b></div><div className="bar-track"><div className="bar-fill" style={{ width: `${count / max * 100}%`, background: COLORS[index % COLORS.length] }} /></div>
  </div>) : <p className="muted">No student records yet.</p>}</div>;
}

export function StatusChart({ students }) {
  const statuses = countBy(students, 'status');
  const total = students.length;
  const palette = { Active: '#8bc5ff', Inactive: '#ffab83', Graduated: '#cda5f8' };
  let offset = 0;
  const slices = statuses.map(([status, count]) => {
    const start = offset; offset += total ? count / total * 100 : 0;
    return `${palette[status] || '#8491a5'} ${start}% ${offset}%`;
  });
  return <div className="donut-layout"><div className="donut" style={{ background: total ? `conic-gradient(${slices.join(', ')})` : 'var(--border)' }}>
    <div className="donut-center"><b>{total}</b><small>Students</small></div></div>
    <div className="donut-legend">{statuses.map(([status, count]) => <div key={status}><span className="legend-dot" style={{ background: palette[status] || '#8491a5' }} />{status}<strong>{count}</strong></div>)}</div>
  </div>;
}

export function YearChart({ students }) {
  const entries = countBy(students, 'year').sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  const max = Math.max(1, ...entries.map(([, count]) => count));
  return <div className="bar-list">{entries.length ? entries.map(([year, count]) => <div className="bar-item" key={year}>
    <div className="bar-caption"><span>Year {year}</span><b>{count}</b></div><div className="bar-track"><div className="bar-fill" style={{ width: `${count / max * 100}%` }} /></div>
  </div>) : <p className="muted">No student records yet.</p>}</div>;
}
