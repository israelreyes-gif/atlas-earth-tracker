// Ajustes: lo que da por segundo cada tipo de parcela (como lo muestra el juego) y cerrar sesión.
import { estimate } from '../calc.js';
import { parseNumber } from '../format.js';
import { escapeHtml } from '../html.js';
import { rateToText } from '../rate-text.js';
import { clearKey } from '../session.js';
import { persist, saveRates, state } from '../store.js';

export function renderSettings(container) {
  container.innerHTML = `
    <h1>Ajustes</h1>
    <form class="card" id="settings-form" novalidate>
      <span class="title">Lo que da cada parcela</span>
      <span class="muted small">En $ por segundo, tal como lo muestra el juego. La app lo pasa a día y a mes.</span>
      ${state.types.map((type) => `
        <div class="field">
          <label for="rate-${escapeHtml(type.id)}">${escapeHtml(type.name)}</label>
          <input id="rate-${escapeHtml(type.id)}" data-type="${escapeHtml(type.id)}" inputmode="decimal" value="${rateToText(type.rate)}">
        </div>`).join('')}
      <p class="error" id="message" role="alert"></p>
      <button class="btn btn-dark" type="submit">Guardar</button>
      <a class="btn btn-light" href="#home">Volver</a>
    </form>
    <button class="btn btn-light" type="button" id="logout">Cerrar sesión en este dispositivo</button>`;

  const form = container.querySelector('#settings-form');
  const message = container.querySelector('#message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const rates = {};
    for (const input of form.querySelectorAll('input[data-type]')) {
      const rate = parseNumber(input.value);
      if (!(rate >= 0)) {
        message.textContent = 'Cada tipo necesita un número (por ejemplo 0,0000000011).';
        return;
      }
      rates[input.dataset.type] = rate;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      // Antes de cambiar el ritmo se fija el dinero que llevabas con el ritmo anterior.
      const now = new Date();
      const value = estimate(state.account, state.types, now);
      state.account = { total_earned: value.total, balance: value.balance, updated_at: now.toISOString() };
      await persist();
      await saveRates(rates);
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
