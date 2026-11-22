import React from 'react';
import StatCard from '../components/StatCard.jsx';
import StudentTable from '../components/StudentTable.jsx';
import { MajorChart, StatusChart } from '../components/Charts.jsx';
import { getStatistics } from '../utils/studentQueries.js';

export default function Dashboard({ students, actions }) {
  const stats = getStatistics(students);
  const recent = [...students].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5);
  return <>
    <img className="campus-banner" src="/images/aupp-campus.jpg" alt="American University of Phnom Penh campus building" width="1024" height="640" fetchPriority="high" />
    <div className="page-header"><div><h1>Dashboard</h1></div><a className="btn" href="#add">＋ Add Student</a></div>
    <div className="metrics">
      <StatCard label="Total Students" value={stats.total} tone="coral" icon="♙" />
      <StatCard label="Active Students" value={stats.active} tone="blue" icon="✓" />
      <StatCard label="Inactive Students" value={stats.inactive} tone="amber" icon="Ⅱ" />
      <StatCard label="Average GPA" value={stats.averageGpa} tone="purple" icon="↗" />
    </div>
    <div className="dashboard-grid"><section className="card"><div className="section-head"><h2>Students by Major</h2><a className="text-link" href="#analytics">View Analytics →</a></div><MajorChart students={students} /></section>
      <section className="card"><div className="section-head"><h2>Student Status</h2></div><StatusChart students={students} /></section></div>
    <section className="card table-card"><div className="section-head"><h2>Recently Added Students</h2><a className="text-link" href="#students">View All →</a></div><StudentTable students={recent} {...actions} /></section>
  </>;
}
