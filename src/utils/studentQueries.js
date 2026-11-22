export function createDirectoryFilters() {
  return { search: '', major: '', year: '', status: '', sort: 'name-asc', page: 1, perPage: 10 };
}

export function filterStudents(students, filters) {
  const search = filters.search.trim().toLowerCase();
  const filtered = students.filter((student) => (
    (!search || `${student.name} ${student.studentId} ${student.email}`.toLowerCase().includes(search))
    && (!filters.major || student.major === filters.major)
    && (!filters.year || student.year === filters.year)
    && (!filters.status || student.status === filters.status)
  ));
  const [field, direction] = filters.sort.split('-');
  return filtered.sort((first, second) => {
    const comparison = field === 'gpa'
      ? Number(first.gpa) - Number(second.gpa)
      : String(first[field] ?? '').localeCompare(String(second[field] ?? ''), undefined, { numeric: true, sensitivity: 'base' });
    return comparison * (direction === 'desc' ? -1 : 1);
  });
}

export function paginateStudents(students, page, perPage) {
  const pageCount = Math.max(1, Math.ceil(students.length / perPage));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const start = (currentPage - 1) * perPage;
  return {
    rows: students.slice(start, start + perPage),
    page: currentPage,
    pageCount,
    first: students.length ? start + 1 : 0,
    last: Math.min(start + perPage, students.length),
  };
}

export function countBy(students, field) {
  const counts = new Map();
  for (const student of students) {
    const value = student[field] || 'Not set';
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()];
}

export function getStatistics(students) {
  const grades = students.map((student) => student.gpa.trim() ? Number(student.gpa) : NaN)
    .filter((grade) => Number.isFinite(grade) && grade >= 0 && grade <= 4);
  return {
    total: students.length,
    active: students.filter((student) => student.status === 'Active').length,
    inactive: students.filter((student) => student.status === 'Inactive').length,
    averageGpa: grades.length ? (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(2) : '0.00',
  };
}
