import { addStudentLink, pageHeader, selectOptions } from '../components/page.js';
import { bindStudentActions, studentTable } from '../components/studentTable.js';
import { MAJORS, STATUSES, YEARS } from '../data/studentOptions.js';
import { downloadStudentsCsv } from '../utils/csv.js';
import { escapeHtml } from '../utils/formatting.js';
import { createDirectoryFilters, filterStudents, paginateStudents } from '../utils/studentQueries.js';

function pagination(info, total) {
  const pages = Array.from({ length: info.pageCount }, (_, index) => index + 1)
    .filter((page) => info.pageCount <= 7 || page === 1 || page === info.pageCount || Math.abs(page - info.page) <= 1);
  return `<div class="pagination"><span class="muted">Showing ${info.first}–${info.last} of ${total}</span>
    <nav class="pages" aria-label="Student directory pages">
      <button class="page-btn" data-page="${info.page - 1}" aria-label="Previous page" ${info.page === 1 ? 'disabled' : ''}>‹</button>
      ${pages.map((page, index) => `${index && page - pages[index - 1] > 1 ? '<span class="page-gap">…</span>' : ''}
        <button class="page-btn ${page === info.page ? 'active' : ''}" data-page="${page}" aria-label="Page ${page}" ${page === info.page ? 'aria-current="page"' : ''}>${page}</button>`).join('')}
      <button class="page-btn" data-page="${info.page + 1}" aria-label="Next page" ${info.page === info.pageCount ? 'disabled' : ''}>›</button>
    </nav></div>`;
}

export function renderStudents(container, context) {
  const { filters, students, signal } = context;
  const majors = [...MAJORS, ...students.map((student) => student.major)];
  container.innerHTML = `${pageHeader('All Students', 'Browse, search and manage student records.', addStudentLink())}
    <div class="toolbar">
      <input id="search" class="field search-box" type="search" aria-label="Search students" placeholder="Search name, student ID or email…" value="${escapeHtml(filters.search)}">
      <select id="major-filter" data-filter="major" class="select" aria-label="Filter by major">${selectOptions(majors, filters.major, 'All Majors')}</select>
      <select id="year-filter" data-filter="year" class="select" aria-label="Filter by year">${selectOptions(YEARS, filters.year, 'All Years')}</select>
      <select id="status-filter" data-filter="status" class="select" aria-label="Filter by status">${selectOptions(STATUSES, filters.status, 'All Statuses')}</select>
      <select id="sort" data-filter="sort" class="select" aria-label="Sort students">
        <option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option>
        <option value="gpa-desc">Highest GPA</option><option value="gpa-asc">Lowest GPA</option>
        <option value="studentId-asc">Student ID</option>
      </select><button id="clear-filters" class="btn secondary sm">Clear</button>
      <button id="export-csv" class="btn secondary sm">↓ Export CSV</button>
    </div><section class="card table-card" id="directory-results"></section>`;
  container.querySelector('#sort').value = filters.sort;

  function updateResults() {
    const filtered = filterStudents(students, filters);
    const info = paginateStudents(filtered, filters.page, filters.perPage);
    filters.page = info.page;
    container.querySelector('#directory-results').innerHTML = `<div class="section-head">
      <h2>Student Directory</h2><span class="filter-count" role="status">${filtered.length} student${filtered.length === 1 ? '' : 's'} found</span>
      </div>${studentTable(info.rows)}${pagination(info, filtered.length)}`;
  }

  container.querySelector('#search').addEventListener('input', (event) => {
    filters.search = event.target.value;
    filters.page = 1;
    updateResults();
  }, { signal });
  container.addEventListener('change', (event) => {
    const field = event.target.dataset.filter;
    if (!field) return;
    filters[field] = event.target.value;
    filters.page = 1;
    updateResults();
  }, { signal });
  container.addEventListener('click', (event) => {
    const pageButton = event.target.closest('[data-page]');
    if (pageButton && !pageButton.disabled) {
      filters.page = Number(pageButton.dataset.page);
      updateResults();
      container.querySelector(`[data-page="${filters.page}"][aria-current]`)?.focus();
    }
  }, { signal });
  container.querySelector('#clear-filters').addEventListener('click', () => {
    Object.assign(filters, createDirectoryFilters());
    container.querySelector('#search').value = '';
    container.querySelectorAll('[data-filter]').forEach((select) => { select.value = filters[select.dataset.filter]; });
    updateResults();
  }, { signal });
  container.querySelector('#export-csv').addEventListener('click', () => {
    downloadStudentsCsv(filterStudents(students, filters));
    context.notify('CSV exported');
  }, { signal });
  bindStudentActions(container, context.studentActions, signal);
  updateResults();
}
