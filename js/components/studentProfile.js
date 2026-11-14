import { escapeHtml, formatDate, formatGpa, initials } from '../utils/formatting.js';
import { statusBadge } from './page.js';

export function showStudentProfile(student, modal, onEdit) {
  const details = [
    ['Student ID', student.studentId], ['Email', student.email], ['Major', student.major],
    ['Academic Year', `Year ${student.year}`], ['GPA', formatGpa(student.gpa)],
    ['Country', student.country], ['Created', formatDate(student.createdAt)],
  ];
  modal.open('Student Profile', `<div class="profile-heading">
    <span class="initials profile-initials" aria-hidden="true">${escapeHtml(initials(student.name))}</span>
    <div><h3>${escapeHtml(student.name)}</h3>${statusBadge(student.status)}</div>
    </div><dl class="details-grid">${details.map(([label, value]) => `<div>
      <dt class="detail-label">${label}</dt><dd class="detail-value">${escapeHtml(value)}</dd>
    </div>`).join('')}</dl><div class="modal-actions">
      <button class="btn secondary" data-close>Close</button><button class="btn" id="modal-edit">Edit Student</button>
    </div>`);
  document.querySelector('#modal-edit').addEventListener('click', () => {
    modal.close();
    onEdit(student.id);
  });
}
