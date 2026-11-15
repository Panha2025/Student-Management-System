import { fetchCountries } from './api/countriesApi.js';
import { createModal } from './components/modal.js';
import { createNavbar } from './components/navbar.js';
import { createNotifications } from './components/notifications.js';
import { selectOptions } from './components/page.js';
import { createSidebar } from './components/sidebar.js';
import { showStudentProfile } from './components/studentProfile.js';
import { FALLBACK_COUNTRIES } from './data/studentOptions.js';
import { renderAnalytics } from './pages/analytics.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderHelp } from './pages/help.js';
import { renderSettings } from './pages/settings.js';
import { renderStudentForm } from './pages/studentForm.js';
import { renderStudents } from './pages/students.js';
import { navigate, parseRoute, ROUTE_TITLES } from './router.js';
import { connectEndpoint } from './services/settingsService.js';
import * as studentService from './services/studentService.js';
import { escapeHtml } from './utils/formatting.js';
import { createDirectoryFilters } from './utils/studentQueries.js';

const PAGES = {
  dashboard: renderDashboard, students: renderStudents, analytics: renderAnalytics,
  settings: renderSettings, help: renderHelp,
};

export async function startApplication() {
  const content = document.querySelector('#content');
  const notify = createNotifications(document.querySelector('#toasts'));
  const modal = createModal(document.querySelector('#modal-root'), notify);
  const sidebar = createSidebar();
  const navbar = createNavbar(notify);
  const state = {
    students: [], countries: [...FALLBACK_COUNTRIES], filters: createDirectoryFilters(),
    endpoint: '', status: 'loading', error: '', saving: false,
  };
  let pageScope = new AbortController();
  let loadVersion = 0;

  async function changeData(action) {
    if (state.saving) throw new Error('A data change is already in progress. Please wait.');
    state.saving = true;
    try {
      return await action();
    } finally {
      state.saving = false;
    }
  }

  async function loadStudents() {
    const version = ++loadVersion;
    state.status = 'loading';
    state.error = '';
    try {
      state.endpoint = studentService.getEndpoint();
    } catch (error) {
      state.status = 'error';
      state.error = error.message;
      render();
      return;
    }
    render();
    try {
      const students = await studentService.listStudents();
      if (version !== loadVersion) return;
      state.students = students;
      state.status = 'ready';
      state.error = '';
    } catch (error) {
      if (version !== loadVersion) return;
      state.status = 'error';
      state.error = error.message;
    }
    render();
  }

  async function changeEndpoint(value) {
    return changeData(async () => {
      const remoteStudents = await connectEndpoint(value);
      loadVersion += 1;
      state.endpoint = studentService.getEndpoint();
      state.filters = createDirectoryFilters();
      try {
        state.students = remoteStudents ?? await studentService.listStudents();
        state.status = 'ready';
        state.error = '';
      } catch (error) {
        state.status = 'error';
        state.error = error.message;
        throw error;
      } finally {
        render();
      }
      return state.students;
    });
  }

  async function resetDemo() {
    return changeData(async () => {
      const samples = studentService.resetSampleStudents();
      if (!state.endpoint) {
        loadVersion += 1;
        state.students = samples;
        state.status = 'ready';
        state.error = '';
        state.filters = createDirectoryFilters();
      }
      notify('Sample students restored');
      render();
    });
  }

  const studentActions = {
    edit: (id) => navigate(`edit/${encodeURIComponent(id)}`),
    view(id) {
      const student = state.students.find((record) => record.id === id);
      if (student) showStudentProfile(student, modal, studentActions.edit);
    },
    delete(id) {
      const student = state.students.find((record) => record.id === id);
      if (!student) return;
      modal.confirm({
        title: 'Delete student?',
        description: `Permanently delete <b>${escapeHtml(student.name)}</b> (${escapeHtml(student.studentId)})? This action cannot be undone.`,
        confirmLabel: 'Delete Student',
        onConfirm: () => changeData(async () => {
          await studentService.deleteStudent(id);
          state.students = state.students.filter((record) => record.id !== id);
          notify('Student deleted successfully');
          render();
        }),
      });
    },
  };

  function renderDataStatus() {
    if (state.status === 'loading') {
      content.innerHTML = '<section class="card loading-state" role="status"><h1>Loading students…</h1><p>Your data will appear shortly.</p></section>';
      return;
    }
    content.innerHTML = `<section class="card"><h1>Unable to load student data</h1>
      <p>${escapeHtml(state.error)}</p><div class="quick-actions">
        <button class="btn" id="retry-load">Try Again</button>
        <a class="btn secondary" href="#settings">Check Settings</a>
        <button class="btn secondary" id="fallback-demo">Use Demo Mode</button>
      </div></section>`;
    content.querySelector('#retry-load').addEventListener('click', loadStudents, { signal: pageScope.signal });
    content.querySelector('#fallback-demo').addEventListener('click', () => {
      changeEndpoint('').catch((error) => notify(error.message, 'error'));
    }, { signal: pageScope.signal });
  }

  function render() {
    // Abort all listeners belonging to the old page before creating the next one.
    pageScope.abort();
    pageScope = new AbortController();
    modal.close();
    const route = parseRoute(location.hash);
    sidebar.updateRoute(route.name);
    navbar.updateTitle(ROUTE_TITLES[route.name]);
    const signal = pageScope.signal;
    const context = {
      ...state, signal, notify, modal, navigate, studentActions, changeEndpoint, resetDemo,
      toggleTheme: navbar.toggleTheme,
      async saveStudent(input, id) {
        await changeData(async () => {
          const saved = await studentService.saveStudent(input, { id, students: state.students });
          // Use the confirmed write result; a second GET failure must not turn a successful save into a retry.
          state.students = id === null ? [saved, ...state.students]
            : state.students.map((record) => record.id === id ? saved : record);
          if (id === null) state.filters = createDirectoryFilters();
          if (signal.aborted) render();
        });
      },
    };

    try {
      if (state.status !== 'ready' && !['settings', 'help'].includes(route.name)) renderDataStatus();
      else if (route.name === 'add' || route.name === 'edit') {
        renderStudentForm(content, context, route.name === 'edit' ? route.id ?? '' : null);
      } else PAGES[route.name](content, context);
    } catch (error) {
      console.error('Page rendering failed:', error);
      content.innerHTML = `<section class="card"><h1>This page could not be displayed</h1>
        <p>${escapeHtml(error.message)}</p><a href="#dashboard" class="btn">Back to Dashboard</a></section>`;
    }
  }

  window.addEventListener('hashchange', () => {
    render();
    content.focus({ preventScroll: true });
  });
  document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    content.focus();
  });
  fetchCountries({
    onUnavailable: () => notify('The online country list is unavailable. The built-in country list is ready to use.', 'error'),
  }).then((countries) => {
    state.countries = countries;
    const select = content.querySelector('#country');
    if (select) {
      const selected = select.value;
      select.innerHTML = selectOptions([...countries, selected], selected, 'Select country');
    }
  });
  await loadStudents();
}
