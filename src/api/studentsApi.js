import { requestJson } from './http.js';

export const STUDENTS_ENDPOINT = 'https://6af863ea9bdd097c326ed47b.mockapi.io/students';

export async function fetchStudents(endpoint) {
  const students = await requestJson(endpoint);
  if (!Array.isArray(students)) throw new Error('The student API must return a JSON array.');
  return students;
}

export function postStudent(endpoint, student) {
  return requestJson(endpoint, { method: 'POST', data: student });
}

export function putStudent(endpoint, id, student) {
  return requestJson(`${endpoint}/${encodeURIComponent(id)}`, { method: 'PUT', data: student });
}

export function removeStudent(endpoint, id) {
  return requestJson(`${endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
