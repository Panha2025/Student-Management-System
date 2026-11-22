import React, { useState } from 'react';
import { MAJORS, STATUSES, YEARS } from '../data/studentOptions.js';
import { cleanStudentInput, validateStudent } from '../utils/validation.js';

const FIELDS = [
  ['studentId', 'Student ID', 'text', 'e.g. STU1065'], ['name', 'Full Name', 'text', 'e.g. Sok Dara'],
  ['email', 'Email Address', 'email', 'e.g. dara@example.com'], ['major', 'Major', 'select', 'Select major'],
  ['year', 'Academic Year', 'select', 'Select year'], ['gpa', 'GPA (0.00–4.00)', 'number', 'e.g. 3.75'],
  ['country', 'Country', 'select', 'Select country'], ['status', 'Student Status', 'select', 'Select status'],
];

export default function StudentForm({ student, students, countries, onSave, onCancel }) {
  const [values, setValues] = useState(() => Object.fromEntries(FIELDS.map(([key]) => [key, student?.[key] ?? (key === 'country' ? 'Cambodia' : key === 'status' ? 'Active' : '')])));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const options = { major: [...new Set([...MAJORS, ...students.map((record) => record.major)])], year: YEARS, country: [...new Set([...countries, values.country].filter(Boolean))], status: STATUSES };
  async function submit(event) {
    event.preventDefault();
    const input = cleanStudentInput(values);
    const nextErrors = validateStudent(input, students, student?.id ?? null);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try { await onSave(input); } catch (error) {
      if (error.fields) setErrors(error.fields);
    } finally { setBusy(false); }
  }
  return <div className="form-layout"><section className="card">
    <div className="form-header"><h2>Student Information</h2><span className="muted">All fields are required.</span></div>
    <form noValidate onSubmit={submit}><div className="form-grid">
      {FIELDS.map(([name, label, type, placeholder]) => <div className="form-group" key={name}>
        <label htmlFor={name}>{label} <i aria-hidden="true">*</i></label>
        {type === 'select' ? <select className="select" id={name} required value={values[name]} aria-invalid={Boolean(errors[name])} onChange={(event) => setValues({ ...values, [name]: event.target.value })}>
          <option value="">{placeholder}</option>{(options[name] || []).map((option) => <option key={option} value={option}>{name === 'year' ? `Year ${option}` : option}</option>)}
        </select> : <input className="field" id={name} type={type} required placeholder={placeholder} value={values[name]} maxLength={name === 'gpa' ? undefined : 120} min={name === 'gpa' ? '0' : undefined} max={name === 'gpa' ? '4' : undefined} step={name === 'gpa' ? '0.01' : undefined} aria-invalid={Boolean(errors[name])} onChange={(event) => setValues({ ...values, [name]: event.target.value })} />}
        {errors[name] && <small className="field-error" role="alert">{errors[name]}</small>}
      </div>)}
    </div><div className="form-actions"><button type="button" className="btn secondary" onClick={onCancel}>Cancel</button><button className="btn" disabled={busy}>{busy ? 'Saving…' : student ? 'Save Changes' : '＋ Register Student'}</button></div></form>
  </section><aside><section className="card"><h2>Before you save</h2><ul className="tip-list"><li>Use a unique student ID.</li><li>Double-check the email address.</li><li>GPA must be from 0.00 to 4.00.</li><li>Use fictional records in shared API mode.</li></ul></section></aside></div>;
}
