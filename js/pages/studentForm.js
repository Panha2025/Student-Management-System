import { pageHeader, selectOptions } from '../components/page.js';
import { MAJORS, STATUSES, YEARS } from '../data/studentOptions.js';
import { escapeHtml } from '../utils/formatting.js';
import { cleanStudentInput, validateStudent } from '../utils/validation.js';

function formField(name, label, control, hint = '') {
  return `<div class="form-group"><label for="${name}">${label} <i aria-hidden="true">*</i></label>
    ${control}${hint ? `<small class="hint">${hint}</small>` : ''}
    <small class="field-error" id="${name}-error"></small></div>`;
}

function inputField(student, name, label, type, placeholder, constraints = '') {
  return formField(name, label, `<input class="field" id="${name}" name="${name}" type="${type}"
    value="${escapeHtml(student[name])}" placeholder="${placeholder}" required ${constraints} aria-describedby="${name}-error">`);
}

function selectField(student, name, label, values, placeholder, hint = '') {
  return formField(name, label, `<select class="select" id="${name}" name="${name}" required aria-describedby="${name}-error">
    ${selectOptions(values, student[name], placeholder)}</select>`, hint);
}

function showErrors(form, errors) {
  form.querySelectorAll('.field-error').forEach((element) => { element.textContent = ''; });
  form.querySelectorAll('[aria-invalid]').forEach((element) => element.removeAttribute('aria-invalid'));
  for (const [field, message] of Object.entries(errors)) {
    form.elements[field].setAttribute('aria-invalid', 'true');
    form.querySelector(`#${field}-error`).textContent = message;
  }
  form.elements[Object.keys(errors)[0]]?.focus();
}

export function renderStudentForm(container, context, id = null) {
  const editing = id !== null;
  const student = editing ? context.students.find((record) => record.id === id) : {
    studentId: '', name: '', email: '', major: '', year: '', gpa: '', country: 'Cambodia', status: 'Active',
  };
  if (!student) {
    container.innerHTML = `${pageHeader('Student not found', 'This record may have been removed.')}
      <a class="btn" href="#students">Back to Students</a>`;
    return;
  }
  const majors = [...MAJORS, ...context.students.map((record) => record.major)];
  container.innerHTML = `${pageHeader(editing ? 'Edit Student' : 'Add New Student',
    editing ? 'Update an existing student record.' : 'Fill in the information below to register a new student.',
    '<a class="btn secondary" href="#students">← Back to Students</a>')}
    <div class="form-layout"><section class="card">
      <div class="form-header"><h2>Student Information</h2><span class="muted">All fields are required.</span></div>
      <form id="student-form" novalidate><div class="form-grid">
        ${inputField(student, 'studentId', 'Student ID', 'text', 'e.g. STU1065', 'maxlength="120"')}
        ${inputField(student, 'name', 'Full Name', 'text', 'e.g. Sok Dara', 'maxlength="120" autocomplete="name"')}
        ${inputField(student, 'email', 'Email Address', 'email', 'e.g. dara@example.com', 'maxlength="120" autocomplete="email"')}
        ${selectField(student, 'major', 'Major', majors, 'Select major')}
        ${selectField(student, 'year', 'Academic Year', YEARS, 'Select year')}
        ${inputField(student, 'gpa', 'GPA (0.00–4.00)', 'number', 'e.g. 3.75', 'min="0" max="4" step="0.01"')}
        ${selectField(student, 'country', 'Country', [...context.countries, student.country], 'Select country', 'Country names load from a public service, with an offline fallback.')}
        ${selectField(student, 'status', 'Student Status', STATUSES, 'Select status')}
      </div><div class="form-actions"><a href="#students" class="btn secondary">Cancel</a>
        <button class="btn" id="submit-student" type="submit">${editing ? 'Save Changes' : '＋ Register Student'}</button>
      </div></form></section><aside>
      <div class="card"><h2>Before you save</h2><ul class="tip-list">
        <li>Use a unique student ID.</li><li>Enter the student's complete name.</li>
        <li>Double-check the email address.</li><li>GPA must be from 0.00 to 4.00.</li>
        <li>Choose the correct major and year.</li></ul></div>
    </aside></div>`;

  const form = container.querySelector('#student-form');
  const submit = form.querySelector('#submit-student');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const input = cleanStudentInput(Object.fromEntries(new FormData(form)));
    const errors = validateStudent(input, context.students, id);
    showErrors(form, errors);
    if (Object.keys(errors).length) return;
    const label = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Saving…';
    try {
      await context.saveStudent(input, id);
      context.notify(editing ? 'Student updated successfully' : 'Student added successfully');
      if (!context.signal.aborted) context.navigate('students');
    } catch (error) {
      if (error.fields) showErrors(form, error.fields);
      context.notify(`Could not save: ${error.message}`, 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  }, { signal: context.signal });
}
