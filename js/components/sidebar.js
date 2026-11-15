export function createSidebar() {
  const sidebar = document.querySelector('#sidebar');
  const toggle = document.querySelector('#menu-toggle');
  const backdrop = document.querySelector('#sidebar-backdrop');

  function setOpen(open) {
    sidebar.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
  }

  toggle.addEventListener('click', () => setOpen(!sidebar.classList.contains('open')));
  backdrop.addEventListener('click', () => setOpen(false));
  sidebar.addEventListener('click', (event) => {
    // Clicking the current route does not fire hashchange, but must still close the menu.
    if (event.target.closest('a[href^="#"]')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  return {
    updateRoute(route) {
      sidebar.querySelectorAll('[data-route]').forEach((link) => {
        const active = link.dataset.route === (route === 'edit' ? 'students' : route);
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      setOpen(false);
    },
  };
}
