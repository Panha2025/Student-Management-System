import { formatDate } from '../utils/formatting.js';
import { readSetting, STORAGE_KEYS, writeSetting } from '../services/storageService.js';

export function createNavbar(notify) {
  const themeButton = document.querySelector('#theme-btn');

  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    themeButton.textContent = dark ? '☀' : '☾';
    themeButton.setAttribute('aria-pressed', String(dark));
  }

  function toggleTheme() {
    const dark = !document.documentElement.classList.contains('dark');
    applyTheme(dark);
    try {
      writeSetting(STORAGE_KEYS.theme, dark ? 'dark' : 'light');
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  try {
    applyTheme(readSetting(STORAGE_KEYS.theme) === 'dark');
  } catch (error) {
    notify(error.message, 'error');
  }
  document.querySelector('#today').textContent = formatDate(new Date(), {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
  themeButton.addEventListener('click', toggleTheme);

  return {
    toggleTheme,
    updateTitle(title) {
      document.querySelector('#current-page').textContent = title;
      document.title = `${title} | AUPP Student Management`;
    },
  };
}
