import React from 'react';
import StatCard from '../components/StatCard.jsx';
import { MajorChart, StatusChart, YearChart } from '../components/Charts.jsx';
import { getStatistics } from '../utils/studentQueries.js';
export default function Analytics({ students }) {
  const stats = getStatistics(students);
  return <><div className="page-header"><div><h1>Analytics</h1><p>Enrollment and academic performance.</p></div><button className="btn secondary" onClick={() => window.print()}>↧ Print Report</button></div>
    <div className="metrics"><StatCard label="Total Students" value={stats.total} tone="coral" icon="♙" /><StatCard label="Active Students" value={stats.active} tone="blue" icon="✓" /><StatCard label="Inactive Students" value={stats.inactive} tone="amber" icon="Ⅱ" /><StatCard label="Average GPA" value={stats.averageGpa} tone="purple" icon="↗" /></div>
    <div className="dashboard-grid"><section className="card"><h2>Enrollment by Major</h2><MajorChart students={students} /></section><section className="card"><h2>Enrollment Status</h2><StatusChart students={students} /></section></div>
    <div className="dashboard-grid section-spacing"><section className="card"><h2>Students by Academic Year</h2><YearChart students={students} /></section><section className="card"><h2>Academic Performance</h2><div className="metric-value performance-value">{stats.averageGpa}</div><p className="muted">Average GPA out of 4.00</p><div className="notice">Charts update when student records change.</div></section></div>
  </>;
}
