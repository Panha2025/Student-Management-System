import { fetchStudents, postStudent, putStudent, removeStudent, STUDENTS_ENDPOINT } from '../api/studentsApi.js';
import { createSampleStudents } from '../data/sampleStudents.js';
import { STUDENT_FIELDS } from '../data/studentOptions.js';
import { cleanStudentInput, validateStudent } from '../utils/validation.js';
import { readSetting, readStudents, STORAGE_KEYS, writeStudents } from './storageService.js';

export function getEndpoint() {
  return readSetting(STORAGE_KEYS.endpoint, STUDENTS_ENDPOINT).trim().replace(/\/+$/, '');
}

export function normalizeStudent(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record) || record.id == null || String(record.id).trim() === '') {
    throw new Error('Every student record must have an id. Check your data source in Settings.');
  }
  return {
    ...Object.fromEntries(STUDENT_FIELDS.map((field) => {
      const value = field === 'name' ? record.fullName ?? record.name
        : field === 'year' ? record.academicYear ?? record.year
          : record[field];
      return [field, String(value ?? '')];
    })),
    id: String(record.id),
    status: String(record.status ?? 'Active'),
    createdAt: String(record.createdAt ?? ''),
  };
}

function toApiStudent(student) {
  return {
    studentId: student.studentId,
    fullName: student.name,
    email: student.email,
    major: student.major,
    academicYear: student.year,
    gpa: Number(student.gpa),
    country: student.country,
    status: student.status,
    createdAt: student.createdAt,
  };
}

export function normalizeStudents(records) {
  const students = records.map(normalizeStudent);
  if (new Set(students.map((student) => student.id)).size !== students.length) {
    throw new Error('Student records have duplicate internal ids. Check your data source in Settings.');
  }
  return students;
}

function getLocalStudents() {
  const saved = readStudents();
  if (saved !== null) return normalizeStudents(saved);
  return resetSampleStudents();
}

export async function listStudents() {
  const endpoint = getEndpoint();
  return endpoint ? normalizeStudents(await fetchStudents(endpoint)) : getLocalStudents();
}

export async function saveStudent(input, { id = null, students = [] } = {}) {
  const endpoint = getEndpoint();
  const currentStudents = endpoint ? students : getLocalStudents();
  const student = cleanStudentInput(input);
  const errors = validateStudent(student, currentStudents, id);
  if (Object.keys(errors).length) {
    const error = new Error(Object.values(errors)[0]);
    error.fields = errors;
    throw error;
  }
  const existing = id === null ? null : currentStudents.find((record) => record.id === id);
  if (id !== null && !existing) throw new Error('Student not found. Reload the directory and try again.');
  const payload = { ...student, createdAt: existing?.createdAt || new Date().toISOString() };

  if (endpoint) {
    const apiStudent = toApiStudent(payload);
    const response = id === null
      ? await postStudent(endpoint, apiStudent)
      : await putStudent(endpoint, id, apiStudent);
    // PUT may return 204; POST must return the server-assigned id for future edits.
    if (id === null && (response?.id == null || String(response.id).trim() === '')) {
      throw new Error('The server accepted the save but returned no id. Reload the directory before retrying.');
    }
    return normalizeStudent({ ...apiStudent, ...response, id: id ?? response.id });
  }

  const saved = { ...payload, id: id ?? crypto.randomUUID() };
  writeStudents(id === null ? [saved, ...currentStudents] : currentStudents.map((record) => (
    record.id === id ? saved : record
  )));
  return saved;
}

export async function deleteStudent(id) {
  const endpoint = getEndpoint();
  if (endpoint) {
    await removeStudent(endpoint, id);
    return;
  }
  const students = getLocalStudents();
  if (!students.some((student) => student.id === id)) throw new Error('Student not found.');
  writeStudents(students.filter((student) => student.id !== id));
}

export function resetSampleStudents() {
  const students = createSampleStudents();
  writeStudents(students);
  return students;
}
