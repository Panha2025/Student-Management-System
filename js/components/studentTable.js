import { escapeHtml, formatGpa, initials } from '../utils/formatting.js';
import { statusBadge } from './page.js';

export function studentTable(students) {
  if (!students.length) {
    return `<div class="empty"><div class="emoji" aria-hidden="true">▤</div>
      <h3>No students found</h3><p>Try changing your search or filters, or add a student.</p>
      <a class="btn" href="#add">Add a student</a></div>`;
  }
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="Student records">
    <table><caption class="sr-only">Student records and actions</caption><thead><tr>
      ${['Student', 'Student ID', 'Major', 'Year', 'GPA', 'Status', 'Actions'].map((label) => `<th scope="col">${label}</th>`).join('')}
    </tr></thead><tbody>${students.map((student) => `<tr>
      <td><div class="person"><span class="initials" aria-hidden="true">${escapeHtml(initials(student.name))}</span>
        <div><b>${escapeHtml(student.name)}</b><small>${escapeHtml(student.email)}</small></div></div></td>
      <td>${escapeHtml(student.studentId)}</td><td>${escapeHtml(student.major)}</td>
      <td>Year ${escapeHtml(student.year)}</td><td><b>${formatGpa(student.gpa)}</b></td>
      <td>${statusBadge(student.status)}</td><td><div class="table-actions">
        <button class="action" data-student-action="view" data-id="${escapeHtml(student.id)}" aria-label="View ${escapeHtml(student.name)}" title="View details">◉</button>
        <button class="action" data-student-action="edit" data-id="${escapeHtml(student.id)}" aria-label="Edit ${escapeHtml(student.name)}" title="Edit">✎</button>
        <button class="action delete" data-student-action="delete" data-id="${escapeHtml(student.id)}" aria-label="Delete ${escapeHtml(student.name)}" title="Delete">✕</button>
      </div></td></tr>`).join('')}</tbody></table></div>`;
}

export function bindStudentActions(container, actions, signal) {
  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-student-action]');
    if (button) actions[button.dataset.studentAction]?.(button.dataset.id);
  }, { signal });
}
