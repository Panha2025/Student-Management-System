import { fetchStudents } from '../api/studentsApi.js';
import { validateEndpoint } from '../utils/validation.js';
import { normalizeStudents } from './studentService.js';
import { STORAGE_KEYS, writeSetting } from './storageService.js';

export async function testEndpoint(value) {
  const endpoint = validateEndpoint(value);
  if (!endpoint) throw new Error('Enter an endpoint URL to test.');
  return normalizeStudents(await fetchStudents(endpoint));
}

export async function connectEndpoint(value) {
  const endpoint = validateEndpoint(value);
  const students = endpoint ? await testEndpoint(endpoint) : null;
  // Persist the source only after a successful read, keeping the previous source on failure.
  writeSetting(STORAGE_KEYS.endpoint, endpoint);
  writeSetting(STORAGE_KEYS.mode, endpoint ? 'api' : 'demo');
  return students;
}
