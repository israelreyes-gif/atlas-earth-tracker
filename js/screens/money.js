// Corregir las cifras de dinero con las que muestra el juego (de ellas salen el total y lo gastado).
import { boostRemaining, estimate } from '../calc.js';
import { parseNumber, toInputValue } from '../format.js';
import { currentMultiplier, persist, state } from '../store.js';

export function renderMoney(container) {
  const now = estimate(state.account, state.types, currentMultiplier(), new Date());

  container.innerHTML = `
    <h1>Corregir el dinero</h1>
    <p class="muted">Copia las cifras que ves ahora en el juego.</p>
    <form class="card" id="money-form" novalidate>
      <div class="field">
        <label for="total">Renta total acumulada ($)</label>
        <input id="total" inputmode="decimal" value="${toInputValue(now.total, 8)}">
        <span class="muted small">En el juego: Información del jugador → Renta total acumulada.</span>
      </div>
      <div class="field">
        <label for="balance">Saldo disponible ($)</label>
        <input id="balance" inputmode="decimal" value="${toInputValue(now.balance, 8)}">
        <span class="muted small">En el juego: la cifra de arriba del mapa.</span>
      </div>
      <p class="error" id="message" role="alert"></p>
      <button class="btn btn-dark" type="submit">Guardar</button>
      <a class="btn btn-light" href="#home">Cancelar</a>
    </form>`;

  const form = container.querySelector('#money-form');
  const message = container.querySelector('#message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const total = parseNumber(form.total.value);
    const balance = parseNumber(form.balance.value);
    if (!(total >= 0) || !(balance >= 0)) {
      message.textContent = 'Escribe las dos cifras como números.';
      return;
    }
    if (balance > total) {
      message.textContent = 'El saldo no puede ser mayor que la renta total acumulada.';
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    // El boost sigue corriendo: se guarda lo que queda a partir de este instante.
    const moment = new Date();
    const left = Math.ceil(boostRemaining(state.account, moment));
    state.account = {
      ...state.account,
      total_earned: total,
      spent: total - balance,
      boost_type: left > 0 ? state.account.boost_type : 0,
      boost_seconds: left,
      updated_at: moment.toISOString(),
    };
    try {
      await persist();
      location.hash = '#home';
    } catch (error) {
      message.textContent = `No se pudo guardar: ${error.message}`;
      button.disabled = false;
    }
  });
}
