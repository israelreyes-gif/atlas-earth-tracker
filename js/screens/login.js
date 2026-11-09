// Pantalla de acceso: pide la clave (la misma que el secreto API_KEY del Worker).
import { escapeHtml } from '../html.js';
import { setKey } from '../session.js';

export function renderLogin(container, onDone, message = '') {
  container.innerHTML = `
    <h1>Atlas Tracker</h1>
    <form class="card" id="login-form">
      <div class="field">
        <label for="key">Clave de acceso</label>
        <input id="key" type="password" autocomplete="current-password" required>
      </div>
      <p class="error" role="alert">${escapeHtml(message)}</p>
      <button class="btn btn-dark" type="submit">Entrar</button>
    </form>`;

  container.querySelector('#login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    setKey(container.querySelector('#key').value.trim());
    onDone();
  });
}
