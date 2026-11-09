// Ajustes: valores del juego (editables por si cambian) y cierre de sesión.
import { clearKey } from '../session.js';
import { parseNumber, toInputValue } from '../format.js';
import { saveSettings, state } from '../store.js';

export function renderSettings(container) {
  const { withdraw_threshold: threshold, ab_per_dollar: abPerDollar, parcel_ab: parcelAb } = state.settings;

  container.innerHTML = `
    <h1>Ajustes</h1>
    <form class="card" id="settings-form" novalidate>
      <p class="muted">Valores del juego. Cámbialos solo si el juego los cambia.</p>
      <div class="field">
        <label for="threshold">Mínimo para canjear por dinero real ($)</label>
        <input id="threshold" inputmode="decimal" value="${toInputValue(threshold)}">
      </div>
      <div class="field">
        <label for="abPerDollar">Atlas Bucks por cada 1 $</label>
        <input id="abPerDollar" inputmode="decimal" value="${toInputValue(abPerDollar, 0)}">
      </div>
      <div class="field">
        <label for="parcelAb">Atlas Bucks que cuesta una parcela</label>
        <input id="parcelAb" inputmode="decimal" value="${toInputValue(parcelAb, 0)}">
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
    const values = {
      withdraw_threshold: parseNumber(form.threshold.value),
      ab_per_dollar: parseNumber(form.abPerDollar.value),
      parcel_ab: parseNumber(form.parcelAb.value),
    };
    if (!Object.values(values).every((value) => value > 0)) {
      message.textContent = 'Los tres valores tienen que ser números mayores que 0.';
      return;
    }
    form.querySelector('button').disabled = true;
    try {
      await saveSettings(values);
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
