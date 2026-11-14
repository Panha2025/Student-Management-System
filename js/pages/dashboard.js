import { majorChart, metricCards, statusChart } from '../components/charts.js';
import { addStudentLink, pageHeader } from '../components/page.js';
import { bindStudentActions, studentTable } from '../components/studentTable.js';

export function renderDashboard(container, context) {
  const recentStudents = [...context.students]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt)).slice(0, 5);

  container.innerHTML = `${pageHeader('Dashboard', 'Welcome back! Here is what is happening with your students.', addStudentLink())}
    <section class="welcome"><h2>Make student management effortless ✦</h2>
      <p>Organize records, monitor progress and manage your academic community in one place.</p>
      <a href="#students" class="btn">Explore Students →</a>
    </section>${metricCards(context.students)}
    <div class="dashboard-grid">
      <section class="card"><div class="section-head"><h2>Students by Major</h2>
        <a class="text-link" href="#analytics">View Analytics →</a></div>${majorChart(context.students)}</section>
      <section class="card"><div class="section-head"><h2>Student Status</h2>
        <span class="muted">Overview</span></div>${statusChart(context.students)}</section>
    </div><section class="card table-card"><div class="section-head"><h2>Recently Added Students</h2>
      <a class="text-link" href="#students">View All →</a></div>${studentTable(recentStudents)}</section>`;
  bindStudentActions(container, context.studentActions, context.signal);
}
