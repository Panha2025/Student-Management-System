import React, { useMemo, useState } from 'react';
import StudentTable from '../components/StudentTable.jsx';
import { MAJORS, STATUSES, YEARS } from '../data/studentOptions.js';
import { createDirectoryFilters, filterStudents, paginateStudents } from '../utils/studentQueries.js';
import { downloadStudentsCsv } from '../utils/csv.js';

export default function Students({ students, actions, notify }) {
  const [filters, setFilters] = useState(createDirectoryFilters);
  const filtered = useMemo(() => filterStudents(students, filters), [students, filters]);
  const page = paginateStudents(filtered, filters.page, filters.perPage);
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));
  const majors = [...new Set([...MAJORS, ...students.map((student) => student.major)])].sort();
  return <>
    <div className="page-header"><div><h1>All Students</h1><p>Search and manage student records.</p></div><a className="btn" href="#add">＋ Add Student</a></div>
    <div className="toolbar"><input className="field search-box" type="search" aria-label="Search students" placeholder="Search name, student ID or email…" value={filters.search} onChange={(event) => update('search', event.target.value)} />
      <select className="select" aria-label="Filter by major" value={filters.major} onChange={(event) => update('major', event.target.value)}><option value="">All Majors</option>{majors.map((x) => <option key={x}>{x}</option>)}</select>
      <select className="select" aria-label="Filter by year" value={filters.year} onChange={(event) => update('year', event.target.value)}><option value="">All Years</option>{YEARS.map((x) => <option key={x} value={x}>Year {x}</option>)}</select>
      <select className="select" aria-label="Filter by status" value={filters.status} onChange={(event) => update('status', event.target.value)}><option value="">All Statuses</option>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
      <select className="select" aria-label="Sort students" value={filters.sort} onChange={(event) => update('sort', event.target.value)}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="gpa-desc">Highest GPA</option><option value="gpa-asc">Lowest GPA</option><option value="studentId-asc">Student ID</option></select>
      <button className="btn secondary sm" onClick={() => setFilters(createDirectoryFilters())}>Clear</button><button className="btn secondary sm" onClick={() => { downloadStudentsCsv(filtered); notify('CSV exported'); }}>↓ Export CSV</button>
    </div>
    <section className="card table-card"><div className="section-head"><h2>Student Directory</h2><span className="filter-count" role="status">{filtered.length} student{filtered.length === 1 ? '' : 's'} found</span></div>
      <StudentTable students={page.rows} {...actions} />
      <div className="pagination"><span className="muted">Showing {page.first}–{page.last} of {filtered.length}</span><nav className="pages" aria-label="Student directory pages">
        <button className="page-btn" aria-label="Previous page" disabled={page.page <= 1} onClick={() => update('page', page.page - 1)}>‹</button>
        {Array.from({ length: page.pageCount }, (_, index) => index + 1).filter((n) => page.pageCount <= 7 || n === 1 || n === page.pageCount || Math.abs(n - page.page) <= 1).map((n) => <button key={n} className={`page-btn ${n === page.page ? 'active' : ''}`} aria-current={n === page.page ? 'page' : undefined} onClick={() => update('page', n)}>{n}</button>)}
        <button className="page-btn" aria-label="Next page" disabled={page.page >= page.pageCount} onClick={() => update('page', page.page + 1)}>›</button>
      </nav></div>
    </section>
  </>;
}
