import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createSampleStudents } from '../js/data/sampleStudents.js';
import { cleanStudentInput, validateEndpoint, validateStudent } from '../js/utils/validation.js';
import { createDirectoryFilters, countBy, filterStudents, getStatistics, paginateStudents } from '../js/utils/studentQueries.js';
import { escapeHtml, formatDate, formatGpa } from '../js/utils/formatting.js';
import { createStudentsCsv } from '../js/utils/csv.js';
import { readStudents, STORAGE_KEYS } from '../js/services/storageService.js';
import { deleteStudent, listStudents, normalizeStudents, resetSampleStudents, saveStudent } from '../js/services/studentService.js';
import { connectEndpoint, testEndpoint } from '../js/services/settingsService.js';
import { requestJson } from '../js/api/http.js';
import { fetchCountries } from '../js/api/countriesApi.js';
import { parseRoute } from '../js/router.js';
import { majorChart, metricCards, statusChart } from '../js/components/charts.js';

let memory;
const originalFetch = globalThis.fetch;
const studentInput = {
  studentId: 'QA-100', name: 'Test Student', email: 'test@example.com', major: 'Computer Science',
  year: '2', gpa: '3.75', country: 'Cambodia', status: 'Active',
};

beforeEach(() => {
  memory = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, String(value)),
    },
  });
  globalThis.fetch = originalFetch;
});

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

test('first load seeds 64 students, preserves existing records, and keeps an empty collection empty', async () => {
  const seeded = await listStudents();
  assert.equal(seeded.length, 64);
  assert.equal(new Set(seeded.map((student) => student.studentId)).size, 64);
  assert.equal(new Set(seeded.map((student) => student.major)).size, 8);
  assert.deepEqual(await listStudents(), seeded);
  memory.set(STORAGE_KEYS.students, '[]');
  assert.deepEqual(await listStudents(), []);
});

test('local create, read, update, and delete persist with stable ids and timestamps', async () => {
  const added = await saveStudent({ ...studentInput, name: ' Test Student ' });
  assert.equal(added.name, 'Test Student');
  assert.equal((await listStudents()).length, 65);
  assert.deepEqual((await listStudents()).find((student) => student.id === added.id), added);
  const changed = await saveStudent({ ...added, gpa: '4', status: 'Graduated' }, { id: added.id });
  assert.equal(changed.createdAt, added.createdAt);
  assert.equal(changed.id, added.id);
  assert.equal((await listStudents()).find((student) => student.id === added.id).gpa, '4');
  await deleteStudent(added.id);
  assert.equal((await listStudents()).length, 64);
  await assert.rejects(deleteStudent(added.id), /not found/);
});

test('duplicate ids are case-insensitive and editing the same record is allowed', async () => {
  const added = await saveStudent(studentInput);
  await assert.rejects(saveStudent({ ...studentInput, studentId: 'qa-100' }), /already in use/);
  assert.equal((await saveStudent(added, { id: added.id })).id, added.id);
});

test('validation rejects blank GPA, invalid fields, whitespace, and out-of-range grades', () => {
  for (const gpa of ['', ' ', '-1', '4.1', 'NaN']) {
    assert.ok(validateStudent(cleanStudentInput({ ...studentInput, gpa })).gpa);
  }
  const errors = validateStudent(cleanStudentInput({ ...studentInput, name: ' ', email: 'invalid', year: '8', status: 'Unknown' }));
  for (const field of ['name', 'email', 'year', 'status']) assert.ok(errors[field]);
  assert.deepEqual(validateStudent({ ...studentInput, gpa: '0' }), {});
});

test('bad storage is reported without overwriting the original data', async () => {
  for (const value of ['broken json', '{}', '[null]', '[{"name":"Missing id"}]']) {
    memory.set(STORAGE_KEYS.students, value);
    await assert.rejects(listStudents());
    assert.equal(memory.get(STORAGE_KEYS.students), value);
  }
  assert.equal(resetSampleStudents().length, 64);
  assert.equal(readStudents().length, 64);
});

test('storage write failures surface as errors instead of reporting success', async () => {
  memory.set(STORAGE_KEYS.students, '[]');
  globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  await assert.rejects(saveStudent(studentInput), /Could not save to browser storage/);
  assert.equal(memory.get(STORAGE_KEYS.students), '[]');
});

test('search, combined filters, sorting, and pagination stay consistent after deletion', () => {
  const students = createSampleStudents();
  const filters = { ...createDirectoryFilters(), search: ' STU1001 ' };
  assert.equal(filterStudents(students, filters)[0].studentId, 'STU1001');
  filters.search = '';
  filters.year = '2';
  filters.status = 'Active';
  filters.sort = 'gpa-desc';
  const selected = filterStudents(students, filters);
  assert.ok(selected.every((student) => student.year === '2' && student.status === 'Active'));
  assert.ok(selected.every((student, index) => index === 0 || Number(student.gpa) <= Number(selected[index - 1].gpa)));
  assert.equal(paginateStudents(students, 99, 10).page, 7);
  assert.deepEqual(paginateStudents([], 7, 10), { rows: [], page: 1, pageCount: 1, first: 0, last: 0 });
});

test('all eight majors and unknown statuses are represented in charts', () => {
  const students = createSampleStudents();
  assert.equal((majorChart(students).match(/class="bar-item"/g) || []).length, 8);
  assert.match(majorChart(students), /background:#8bc5ff/);
  assert.match(metricCards(students), />64</);
  assert.match(statusChart([{ ...students[0], status: 'Pending' }]), /Pending/);
  assert.match(statusChart([{ ...students[0], status: '__proto__' }]), /#8491a5/);
  assert.doesNotMatch(statusChart([{ ...students[0], status: '__proto__' }]), /\[object Object\]/);
  assert.match(statusChart([]), /background:var\(--border\)/);
  assert.deepEqual(countBy([{ major: '__proto__' }], 'major'), [['__proto__', 1]]);
  assert.equal(getStatistics([{ ...students[0], gpa: '' }, { ...students[1], gpa: '4' }]).averageGpa, '4.00');
});

test('HTML, CSV, and dates safely handle unusual input', () => {
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
  assert.equal(formatGpa(''), '—');
  assert.equal(formatDate('bad date'), '—');
  const csv = createStudentsCsv([{ ...studentInput, name: '=SUM(1,2)', email: 'a"b@example.com' }]);
  assert.ok(csv.includes('"\'=SUM(1,2)"'));
  assert.ok(csv.includes('"a""b@example.com"'));
});

test('routes handle encoded ids, malformed hashes, and unknown pages', () => {
  assert.deepEqual(parseRoute('#edit/a%2Fb'), { name: 'edit', id: 'a/b' });
  for (const hash of ['#edit/%E0%A4%A', '#unknown', '#constructor', '#__proto__', '']) {
    assert.deepEqual(parseRoute(hash), { name: 'dashboard', id: null });
  }
});

test('URL validation avoids the original regex failure and rejects unsupported URLs', () => {
  assert.equal(validateEndpoint(' https://example.com/students/// '), 'https://example.com/students');
  assert.equal(validateEndpoint(''), '');
  for (const url of ['http://example.com/students', 'javascript:alert(1)', 'bad', 'https://user:secret@example.com', 'https://example.com?key=value']) {
    assert.throws(() => validateEndpoint(url));
  }
});

test('remote CRUD uses correct methods and encoded ids, supports PUT/DELETE 204, and leaves demo data intact', async () => {
  const demo = await listStudents();
  memory.set(STORAGE_KEYS.endpoint, 'https://example.com/students');
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, ...options });
    if (options.method === 'GET') return jsonResponse([]);
    if (options.method === 'POST') return jsonResponse({ ...JSON.parse(options.body), id: 'remote/id' }, 201);
    return new Response(null, { status: 204 });
  };
  assert.deepEqual(await listStudents(), []);
  const created = await saveStudent(studentInput);
  const updated = await saveStudent({ ...created, gpa: '3.95' }, { id: created.id, students: [created] });
  assert.equal(updated.gpa, '3.95');
  assert.equal(updated.id, 'remote/id');
  await deleteStudent(created.id);
  assert.deepEqual(requests.map((request) => request.method), ['GET', 'POST', 'PUT', 'DELETE']);
  assert.equal(requests[2].url, 'https://example.com/students/remote%2Fid');
  assert.equal(requests[0].headers['Content-Type'], undefined);
  assert.deepEqual(JSON.parse(requests[1].body), {
    studentId: 'QA-100', fullName: 'Test Student', email: 'test@example.com', major: 'Computer Science',
    academicYear: '2', gpa: 3.75, country: 'Cambodia', status: 'Active', createdAt: created.createdAt,
  });
  assert.deepEqual(JSON.parse(requests[2].body), {
    studentId: 'QA-100', fullName: 'Test Student', email: 'test@example.com', major: 'Computer Science',
    academicYear: '2', gpa: 3.95, country: 'Cambodia', status: 'Active', createdAt: created.createdAt,
  });
  assert.equal(normalizeStudents([{ id: 'api-1', studentId: '1', fullName: 'Wire Name', academicYear: '4', gpa: 3.2 }])[0].name, 'Wire Name');
  assert.equal(normalizeStudents([{ id: 'api-1', studentId: '1', fullName: 'Wire Name', academicYear: '4', gpa: 3.2 }])[0].year, '4');
  assert.deepEqual(readStudents(), demo);
});

test('connection changes only persist after valid data is returned', async () => {
  memory.set(STORAGE_KEYS.endpoint, 'https://old.example/students');
  globalThis.fetch = async () => jsonResponse({ error: 'wrong shape' });
  await assert.rejects(connectEndpoint('https://new.example/students'), /JSON array/);
  assert.equal(memory.get(STORAGE_KEYS.endpoint), 'https://old.example/students');
  globalThis.fetch = async () => jsonResponse([{ ...studentInput, id: '1' }]);
  assert.equal((await testEndpoint('https://new.example/students')).length, 1);
  assert.equal(memory.get(STORAGE_KEYS.endpoint), 'https://old.example/students');
  assert.equal((await connectEndpoint('https://new.example/students')).length, 1);
  assert.equal(memory.get(STORAGE_KEYS.endpoint), 'https://new.example/students');
  await connectEndpoint('');
  assert.equal(memory.get(STORAGE_KEYS.endpoint), '');
});

test('HTTP errors, invalid JSON, missing ids, and timeouts have useful errors', async () => {
  globalThis.fetch = async () => jsonResponse({}, 500);
  await assert.rejects(requestJson('https://example.com'), /HTTP 500/);
  globalThis.fetch = async () => new Response('not json');
  await assert.rejects(requestJson('https://example.com'), /not valid JSON/);
  assert.throws(() => normalizeStudents([{ id: 1 }, { id: 1 }]), /duplicate/);
  globalThis.fetch = async () => new Response(null, { status: 204 });
  memory.set(STORAGE_KEYS.endpoint, 'https://example.com/students');
  await assert.rejects(saveStudent(studentInput), /Reload the directory before retrying/);
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });
  await assert.rejects(requestJson('https://example.com', { timeout: 5 }), /timed out/);
});

test('countries are sorted and fall back when offline or the payload is malformed', async () => {
  globalThis.fetch = async () => jsonResponse({ error: false, data: [{ name: 'Thailand' }, { name: 'Cambodia' }] });
  assert.deepEqual(await fetchCountries(), ['Cambodia', 'Thailand']);
  let unavailableError;
  globalThis.fetch = async () => { throw new TypeError('Offline'); };
  assert.ok((await fetchCountries({ onUnavailable: (error) => { unavailableError = error; } })).includes('Cambodia'));
  assert.match(unavailableError.message, /Could not reach the API/);
  globalThis.fetch = async () => jsonResponse({ error: false, data: 'bad shape' });
  assert.ok((await fetchCountries()).includes('Cambodia'));
});
