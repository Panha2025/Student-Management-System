import React from 'react';
export default function StatCard({ label, value, tone = 'coral', icon }) {
  return <section className="card metric">
    <div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`} aria-hidden="true">{icon}</span></div>
    <div className="metric-value">{value}</div>
  </section>;
}
