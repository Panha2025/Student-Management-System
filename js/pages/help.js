import { pageHeader } from '../components/page.js';

const STEPS = [
  ['1. Dashboard', 'View student totals, status, academic trends, and recent records.'],
  ['2. All Students', 'Search names, student IDs, or emails. Filter by major, year, and status; sort results; view profiles; edit or delete records.'],
  ['3. Add Student', 'Complete every field with a unique student ID and a GPA from 0.00 to 4.00. Country options have an offline fallback.'],
  ['4. Analytics', 'See all majors, academic years, student statuses, and average GPA. Use Print Report for a printable overview.'],
  ['5. Connect an API', 'Create a students resource in MockAPI, then test and save its full HTTPS URL in Settings. Connecting does not copy local records to the API.'],
  ['6. Export Records', 'Press Export CSV in All Students to download every record matching the current search and filters, in the selected sort order.'],
  ['7. Recover from a data error', 'Check the API URL or switch to Demo Mode in Settings. Reset Demo Data replaces local records after confirmation.'],
];

export function renderHelp(container) {
  container.innerHTML = `${pageHeader('Help & Guide', 'How to use the AUPP Student Management System demo.')}
    <section class="card help-card"><h2>Getting Started</h2>
      <p class="muted">Demo Mode starts with 64 fictional sample students saved in this browser.</p>
      <div class="settings-list">${STEPS.map(([title, description]) => `<div class="setting-item"><div>
        <h3>${title}</h3><p>${description}</p></div></div>`).join('')}</div>
    </section><section class="card help-card section-spacing"><h2>Web Development II Concepts</h2>
      <p class="muted">Semantic HTML, responsive CSS, ES6 modules, event listeners, DOM rendering, form validation,
        search and filtering, asynchronous fetch(), async/await, API CRUD operations, error handling, and localStorage.</p>
      <div class="notice">This is a Web Development II academic project demo. It is not an official AUPP service and has no authentication. Use fictional student data.</div>
    </section>`;
}
