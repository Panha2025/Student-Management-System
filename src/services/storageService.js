// Preserve the original keys so existing browser data survives the refactor.
export const STORAGE_KEYS = {
  students: 'campusflow_students_v1',
  endpoint: 'campusflow_api_url',
  mode: 'campusflow_data_mode',
  theme: 'campusflow_theme',
};

export function readSetting(key, fallback = '') {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    throw new Error('Browser storage is unavailable. Allow site storage and reload.');
  }
}

export function writeSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    throw new Error('Could not save to browser storage. Check available space and site permissions.');
  }
}

export function readStudents() {
  const saved = readSetting(STORAGE_KEYS.students, null);
  if (saved === null) return null;

  try {
    const students = JSON.parse(saved);
    if (!Array.isArray(students)) throw new Error('Invalid student collection');
    return students;
  } catch {
    // Never silently replace damaged data with samples.
    throw new Error('Saved student data is unreadable. Restore a backup or reset demo data in Settings.');
  }
}

export function writeStudents(students) {
  writeSetting(STORAGE_KEYS.students, JSON.stringify(students));
}
