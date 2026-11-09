// Ajustes: importe mínimo para retirar y cierre de sesión.
import { clearKey } from '../session.js';
import { parseNumber, toInputValue } from '../format.js';
import { saveSettings, state } from '../store.js';

export function renderSettings(container) {
  container.innerHTML = `
    <h1>Ajustes</h1>
    <form class="card" id="settings-form" novalidate>
      <div class="field">
        <label for="threshold">Mínimo para retirar (€)</label>
        <input id="threshold" inputmode="decimal" value="${toInputValue(state.settings.withdraw_threshold)}">
      </div>
      <p class="error" id="message" role="alert"></p>
      <button class="btn btn-dark" type="submit">Guardar</button>
      <a class="btn btn-light" href="#home">Volver</a>
    </form>
    <button class="btn btn-light" type="button" id="logout">Cerrar sesión en este dispositivo</button>`;

  const form = container.querySelector('#settings-form');
  const message = container.querySelector('#message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const threshold = parseNumber(form.threshold.value);
    if (!(threshold > 0)) {
      message.textContent = 'Escribe un importe mayor que 0.';
      return;
    }
    form.querySelector('button').disabled = true;
    try {
      await saveSettings({ withdraw_threshold: threshold });
      location.hash = '#home';
    } catch (error) {
      message.textContent = `No se pudo guardar: ${error.message}`;
      form.querySelector('button').disabled = false;
    }
  });

  container.querySelector('#logout').addEventListener('click', () => {
    clearKey();
    location.hash = '';
    location.reload();
  });
}
