// Ajustes: tipos de parcela, valores del juego (editables por si cambian) y cierre de sesión.
import { clearKey } from '../session.js';
import { parseNumber, toInputValue } from '../format.js';
import { saveSettings, state } from '../store.js';
import { typesEditorHtml, wireTypesEditor } from '../ui/types-editor.js';

export function renderSettings(container) {
  const s = state.settings;

  container.innerHTML = `
    <h1>Ajustes</h1>
    <form id="settings-form" novalidate style="display: flex; flex-direction: column; gap: 14px">
      ${typesEditorHtml(state.parcelTypes)}
      <section class="card" aria-label="Valores del juego">
        <span class="title">Valores del juego</span>
        <span class="muted small">Cámbialos solo si el juego los cambia.</span>
        <div class="field">
          <label for="multiplier">Multiplicador (boosts y pasaporte)</label>
          <input id="multiplier" inputmode="decimal" value="${toInputValue(s.income_multiplier, 2)}">
          <span class="muted small">Déjalo en 1 si no lo sabes: al guardar un registro puedes corregir la ganancia diaria a mano.</span>
        </div>
        <div class="field">
          <label for="threshold">Mínimo para canjear por dinero real ($)</label>
          <input id="threshold" inputmode="decimal" value="${toInputValue(s.withdraw_threshold)}">
        </div>
        <div class="field">
          <label for="abPerDollar">Atlas Bucks por cada 1 $</label>
          <input id="abPerDollar" inputmode="decimal" value="${toInputValue(s.ab_per_dollar, 0)}">
        </div>
        <div class="field">
          <label for="parcelAb">Atlas Bucks que cuesta una parcela</label>
          <input id="parcelAb" inputmode="decimal" value="${toInputValue(s.parcel_ab, 0)}">
        </div>
      </section>
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
    const typesResult = readTypes();
    if (typesResult.error) {
      message.textContent = typesResult.error;
      return;
    }
    const values = {
      income_multiplier: parseNumber(form.multiplier.value),
      withdraw_threshold: parseNumber(form.threshold.value),
      ab_per_dollar: parseNumber(form.abPerDollar.value),
      parcel_ab: parseNumber(form.parcelAb.value),
    };
    if (!Object.values(values).every((value) => value > 0)) {
      message.textContent = 'Los valores del juego tienen que ser números mayores que 0.';
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await saveSettings({ ...values, parcel_types: typesResult.types });
      location.hash = '#home';
    } catch (error) {
      message.textContent = `No se pudo guardar: ${error.message}`;
      button.disabled = false;
    }
  });

  container.querySelector('#logout').addEventListener('click', () => {
    clearKey();
    location.hash = '';
    location.reload();
  });
}
