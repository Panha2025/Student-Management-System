// Keep bootstrap independent so an import/startup failure still produces a visible message.
async function boot() {
  try {
    const { startApplication } = await import('./main.js');
    await startApplication();
  } catch (error) {
    console.error('CampusFlow could not start:', error);
    const content = document.querySelector('#content');
    content.replaceChildren();
    const card = document.createElement('section');
    card.className = 'card';
    const title = document.createElement('h1');
    title.textContent = 'CampusFlow could not start';
    const message = document.createElement('p');
    message.textContent = 'Open index.html through VS Code Live Server, then reload. Check that all project files are present.';
    const detail = document.createElement('p');
    detail.textContent = error.message;
    const reload = document.createElement('button');
    reload.className = 'btn';
    reload.textContent = 'Reload application';
    reload.addEventListener('click', () => window.location.reload());
    card.append(title, message, detail, reload);
    content.append(card);
  }
}

boot();
