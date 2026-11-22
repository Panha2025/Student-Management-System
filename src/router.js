export const ROUTE_TITLES = {
  dashboard: 'Dashboard', students: 'All Students', add: 'Add Student', edit: 'Edit Student',
  analytics: 'Analytics', settings: 'Settings', help: 'Help & Guide',
};

export function parseRoute(hash) {
  const [name = 'dashboard', encodedId] = (hash.replace(/^#/, '') || 'dashboard').split('/');
  if (!Object.hasOwn(ROUTE_TITLES, name)) return { name: 'dashboard', id: null };
  try {
    return { name, id: encodedId ? decodeURIComponent(encodedId) : null };
  } catch {
    return { name: 'dashboard', id: null };
  }
}

export function navigate(route) {
  window.location.hash = route;
}
