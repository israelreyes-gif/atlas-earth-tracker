// Ajustes: mínimo para retirar, tipos de parcela y cierre de sesión.
import { clearKey } from '../session.js';
import { parseNumber, toInputValue } from '../format.js';
import { saveSettings, state } from '../store.js';
import { typesEditorHtml, wireTypesEditor } from '../ui/types-editor.js';

export function renderSettings(container) {
  container.innerHTML = `
    <h1>Ajustes</h1>
    <form id="settings-form" novalidate style="display: flex; flex-direction: column; gap: 14px">
      <section class="card">
        <div class="field">
          <label for="threshold">Mínimo para retirar (€)</label>
          <input id="threshold" inputmode="decimal" value="${toInputValue(state.settings.withdraw_threshold)}">
        </div>
      </section>
      ${typesEditorHtml(state.settings.parcel_types)}
      <p class="error" id="message" role="alert"></p>
      <button class="btn btn-dark" type="submit">Guardar</button>
      <a class="btn btn-light" href="#home">Volver</a>
    </form>
    <button class="btn btn-light" type="button" id="logout">Cerrar sesión en este dispositivo</button>`;

  const form = container.querySelector('#settings-form');
  const message = container.querySelector('#message');
  const readTypes = wireTypesEditor(container);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const threshold = parseNumber(form.threshold.value);
    if (!(threshold > 0)) {
      message.textContent = 'Escribe un importe mayor que 0 para el mínimo de retirada.';
      return;
    }
    const { types, error } = readTypes();
    if (error) {
      message.textContent = error;
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    message.textContent = '';
    try {
      await saveSettings({ withdraw_threshold: threshold, parcel_types: types });
      location.hash = '#home';
    } catch (err) {
      message.textContent = `No se pudo guardar: ${err.message}`;
      button.disabled = false;
    }
  });

  container.querySelector('#logout').addEventListener('click', () => {
    clearKey();
    location.hash = '';
    location.reload();
  });
}
