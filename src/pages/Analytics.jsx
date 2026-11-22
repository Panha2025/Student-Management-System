import React from 'react';
import { MajorChart, StatusChart, YearChart } from '../components/Charts.jsx';
export default function Analytics({ students }) {
  return <><div className="page-header"><div><h1>Analytics</h1></div><button className="btn secondary" onClick={() => window.print()}>↧ Print Report</button></div>
    <div className="dashboard-grid"><section className="card"><h2>Enrollment by Major</h2><MajorChart students={students} /></section><section className="card"><h2>Enrollment Status</h2><StatusChart students={students} /></section></div>
    <section className="card section-spacing"><h2>Students by Academic Year</h2><YearChart students={students} /></section>
  </>;
}
