import { barChart, majorChart, metricCards, statusChart } from '../components/charts.js';
import { pageHeader } from '../components/page.js';
import { countBy, getStatistics } from '../utils/studentQueries.js';

export function renderAnalytics(container, context) {
  const { students, signal } = context;
  const years = countBy(students, 'year').sort(([first], [second]) => first.localeCompare(second))
    .map(([year, count]) => [`Year ${year}`, count]);
  container.innerHTML = `${pageHeader('Student Analytics', 'Explore academic insights and student performance.',
    '<button class="btn secondary" id="print-page">↧ Print Report</button>')}
    ${metricCards(students)}<div class="dashboard-grid">
      <section class="card"><div class="section-head"><h2>Enrollment by Major</h2>
        <span class="muted">All majors</span></div>${majorChart(students)}</section>
      <section class="card"><div class="section-head"><h2>Enrollment Status</h2></div>${statusChart(students)}</section>
    </div><div class="dashboard-grid">
      <section class="card"><h2>Students by Academic Year</h2>${barChart(years)}</section>
      <section class="card"><h2>Academic Performance</h2>
        <div class="metric-value performance-value">${getStatistics(students).averageGpa}</div><p class="muted">Overall average GPA</p>
        <div class="notice">GPA values range from 0.00 to 4.00. Statistics update automatically when students are added, edited, or removed.</div>
      </section></div>`;
  container.querySelector('#print-page').addEventListener('click', () => window.print(), { signal });
}
