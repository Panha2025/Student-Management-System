import { MAJORS } from './studentOptions.js';

const FIRST_NAMES = [
  'Sok', 'Dara', 'Sophea', 'Vanna', 'Sreypov', 'Chenda', 'Rith', 'Pisey',
  'Mony', 'Bora', 'Sokha', 'Lina', 'Sovann', 'Rina', 'Nita', 'Makara',
  'Vichea', 'Pheaktra', 'Kanha', 'Sothea',
];
const LAST_NAMES = [
  'Chan', 'Kim', 'Heng', 'Lim', 'Sok', 'Chea', 'Ly', 'Mao', 'San', 'Keo',
  'Meas', 'Long', 'Touch', 'Ouk', 'Sim',
];

export function createSampleStudents() {
  return Array.from({ length: 64 }, (_, index) => {
    const name = `${FIRST_NAMES[(index * 7 + 3) % FIRST_NAMES.length]} ${LAST_NAMES[(index * 11 + 2) % LAST_NAMES.length]}`;

    return {
      id: String(index + 1),
      studentId: `STU${1001 + index}`,
      name,
      email: `${name.toLowerCase().replaceAll(' ', '.')}${index + 1}@example.com`,
      major: MAJORS[(index * 5 + Math.floor(index / 9)) % MAJORS.length],
      year: String(index % 4 + 1),
      gpa: (2.15 + (index * 37 % 180) / 100).toFixed(2),
      country: index % 10 === 0 ? 'Thailand' : index % 13 === 0 ? 'Vietnam' : 'Cambodia',
      status: index % 13 === 0 ? 'Graduated' : index % 7 === 0 ? 'Inactive' : 'Active',
      createdAt: new Date(Date.UTC(2026, 8, 1 + index % 57)).toISOString(),
    };
  });
}
