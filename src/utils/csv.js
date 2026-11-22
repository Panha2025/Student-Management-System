import { STUDENT_FIELDS } from '../data/studentOptions.js';

function escapeCsvCell(value) {
  let text = String(value ?? '');
  // Spreadsheet apps interpret formula prefixes even inside quoted CSV cells.
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function createStudentsCsv(students) {
  return [
    STUDENT_FIELDS.join(','),
    ...students.map((student) => STUDENT_FIELDS.map((field) => escapeCsvCell(student[field])).join(',')),
  ].join('\r\n');
}

export function downloadStudentsCsv(students) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', createStudentsCsv(students)], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'campusflow-students.csv';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
