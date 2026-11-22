import React from 'react';
import { initials, formatGpa } from '../utils/formatting.js';

export default function StudentTable({ students, onProfile, onEdit, onDelete }) {
  if (!students.length) return <div className="empty"><div className="emoji" aria-hidden="true">♙</div><h3>No students found</h3><p>Try changing the search or filters, or add a student record.</p></div>;
  return <div className="table-scroll"><table>
    <thead><tr><th>Student</th><th>Student ID</th><th>Major</th><th>Year</th><th>GPA</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
    <tbody>{students.map((student) => <tr key={student.id}>
      <td><button className="person person-button" onClick={() => onProfile(student)}><span className="initials">{initials(student.name)}</span><span><b>{student.name}</b><small>{student.email}</small></span></button></td>
      <td>{student.studentId}</td><td>{student.major}</td><td>{student.year}</td><td>{formatGpa(student.gpa)}</td>
      <td><span className={`badge ${student.status.toLowerCase()}`}>{student.status}</span></td>
      <td><div className="table-actions"><button className="action" aria-label={`Edit ${student.name}`} onClick={() => onEdit(student)}>Edit</button><button className="action delete" aria-label={`Delete ${student.name}`} onClick={() => onDelete(student)}>×</button></div></td>
    </tr>)}</tbody>
  </table></div>;
}
