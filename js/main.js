// Arranque: comprueba la clave, carga los datos y enseña la pantalla según el #hash.
import { escapeHtml } from './html.js';
import { clearKey, hasKey } from './session.js';
import { loadAll } from './store.js';
import { renderEvolution } from './screens/evolution.js';
import { renderGoals } from './screens/goals.js';
import { renderHome } from './screens/home.js';
import { renderLogin } from './screens/login.js';
import { renderPurchases } from './screens/purchases.js';
import { renderSettings } from './screens/settings.js';
import { renderUpdate } from './screens/update.js';
import { renderNav } from './ui/nav.js';

const screen = document.querySelector('#screen');
const nav = document.querySelector('#nav');

const ROUTES = {
  home: renderHome,
  evolution: renderEvolution,
  goals: renderGoals,
  purchases: renderPurchases,
  update: renderUpdate,
  settings: renderSettings,
};

let ready = false;
let cleanup = null;

function show() {
  if (!ready) return;
  if (cleanup) cleanup();
  const route = location.hash.slice(1) in ROUTES ? location.hash.slice(1) : 'home';
  nav.hidden = false;
  renderNav(nav, route);
  window.scrollTo(0, 0);
  cleanup = ROUTES[route](screen) ?? null;
}

async function start(message = '') {
  ready = false;
  nav.hidden = true;

  if (!hasKey()) {
    renderLogin(screen, () => start(), message);
    return;
  }

  screen.innerHTML = '<p class="muted">Cargando…</p>';
  try {
    await loadAll();
  } catch (error) {
    if (error.status === 401) {
      clearKey();
      start('Clave incorrecta');
      return;
    }
    screen.innerHTML = `
      <h1>Atlas Tracker</h1>
      <div class="card">
        <p>No se pudo conectar con el servidor.</p>
        <p class="muted">${escapeHtml(error.message)}</p>
        <button class="btn btn-dark" id="retry" type="button">Reintentar</button>
      </div>`;
    screen.querySelector('#retry').addEventListener('click', () => start());
    return;
  }

  ready = true;
  show();
}

window.addEventListener('hashchange', show);

// Service worker: se busca una versión nueva en cada visita y, si la hay, se recarga una vez.
if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });
  navigator.serviceWorker
    .register('sw.js', { updateViaCache: 'none' })
    .then((registration) => registration.update())
    .catch(() => {});
}

start();
