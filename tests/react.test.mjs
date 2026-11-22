import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { createSampleStudents } from '../src/data/sampleStudents.js';

let vite;
let Dashboard;
let Students;
let StudentForm;
let Analytics;
let Settings;
const records = createSampleStudents();
before(async () => {
  vite = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ default: Dashboard } = await vite.ssrLoadModule('/src/pages/Dashboard.jsx'));
  ({ default: Students } = await vite.ssrLoadModule('/src/pages/Students.jsx'));
  ({ default: StudentForm } = await vite.ssrLoadModule('/src/components/StudentForm.jsx'));
  ({ default: Analytics } = await vite.ssrLoadModule('/src/pages/Analytics.jsx'));
  ({ default: Settings } = await vite.ssrLoadModule('/src/pages/Settings.jsx'));
});
after(async () => { await vite?.close(); });

test('React dashboard renders the campus image, live metrics, charts, and recent students', () => {
  const html = renderToStaticMarkup(React.createElement(Dashboard, { students: records, actions: {} }));
  assert.match(html, /\/images\/aupp-campus\.jpg/);
  assert.match(html, /Total Students/);
  assert.match(html, />64<\/div>/);
  assert.match(html, /Students by Major/);
  assert.match(html, /Student Status/);
  assert.match(html, /Recently Added Students/);
  assert.match(html, /Sok/);
});

test('React directory renders search, filters, sorting, pagination, and student rows', () => {
  const html = renderToStaticMarkup(React.createElement(Students, { students: records, actions: {}, notify() {} }));
  for (const label of ['Search students', 'Filter by major', 'Filter by year', 'Filter by status', 'Sort students', 'Export CSV']) assert.ok(html.includes(label), label);
  assert.match(html, /STU\d+/);
});

test('React student form renders controlled fields and available country options', () => {
  const html = renderToStaticMarkup(React.createElement(StudentForm, { students: records, countries: ['Cambodia', 'Thailand'], onSave() {}, onCancel() {} }));
  for (const field of ['Student ID', 'Full Name', 'Email Address', 'Major', 'Academic Year', 'GPA', 'Country', 'Student Status']) assert.ok(html.includes(field), field);
  assert.match(html, />Thailand<\/option>/);
  assert.match(html, /Register Student/);
});

test('React analytics and settings render charts and explicit shared-data warnings', () => {
  const analytics = renderToStaticMarkup(React.createElement(Analytics, { students: records }));
  assert.match(analytics, /Students by Academic Year/);
  assert.match(analytics, /Academic Performance/);
  const settings = renderToStaticMarkup(React.createElement(Settings, { endpoint: 'https://example.test/students', theme: 'dark', toggleTheme() {}, setMode() {}, testApi() {}, resetDemo() {}, notify() {}, modeBusy: false, setModeBusy() {} }));
  assert.match(settings, /Switch to Demo Mode/);
  assert.match(settings, /anyone who knows this endpoint may read or modify shared records/i);
});
