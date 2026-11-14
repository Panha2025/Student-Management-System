import { STATUSES, STUDENT_FIELDS, YEARS } from '../data/studentOptions.js';

export function cleanStudentInput(input) {
  return Object.fromEntries(STUDENT_FIELDS.map((field) => [
    field, String(input[field] ?? '').trim(),
  ]));
}

export function validateStudent(student, students = [], editingId = null) {
  const errors = {};
  for (const field of STUDENT_FIELDS) {
    if (!student[field]?.trim()) errors[field] = 'This field is required.';
  }

  if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (student.gpa && (!Number.isFinite(Number(student.gpa)) || Number(student.gpa) < 0 || Number(student.gpa) > 4)) {
    errors.gpa = 'GPA must be between 0.00 and 4.00.';
  }
  if (student.year && !YEARS.includes(student.year)) errors.year = 'Choose an academic year from 1 to 5.';
  if (student.status && !STATUSES.includes(student.status)) errors.status = 'Choose a valid student status.';

  for (const field of ['studentId', 'name', 'email']) {
    if (student[field]?.length > 120) errors[field] = 'Use no more than 120 characters.';
  }
  if (students.some((existing) => (
    existing.studentId.toLowerCase() === student.studentId?.toLowerCase()
    && existing.id !== editingId
  ))) {
    errors.studentId = 'This student ID is already in use.';
  }
  return errors;
}

export function validateEndpoint(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('Enter a complete HTTPS endpoint URL.');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search) {
    throw new Error('Use an HTTPS resource URL without credentials, query parameters, or a fragment.');
  }
  return url.href.replace(/\/+$/, '');
}
