// Tarjeta de lo invertido: apuntar con − y + lo que se invierte en AB en el juego (1 $ por pulsación).
import { formatDollar } from '../format.js';

export const SPENT_STEP = 1;

export function spentHtml() {
  return `
    <section class="badges" aria-label="Invertido">
      <div class="badges-info">
        <span class="title">Invertido</span>
        <span class="muted small">${SPENT_STEP} $ por pulsación</span>
      </div>
      <div class="badges-controls">
        <button type="button" class="tile-btn" data-spent="-1" aria-label="Quitar ${SPENT_STEP} dólar de invertido">−</button>
        <span class="num badges-count" id="spent-value"></span>
        <button type="button" class="tile-btn" data-spent="1" aria-label="Añadir ${SPENT_STEP} dólar de invertido">+</button>
      </div>
    </section>`;
}

// spent: invertido; balance: saldo ahora. Bloquea − sin inversión y + sin saldo para invertir.
export function refreshSpent(root, spent, balance) {
  root.querySelector('#spent-value').textContent = formatDollar(spent, 0);
  root.querySelector('[data-spent="-1"]').disabled = spent < SPENT_STEP;
  root.querySelector('[data-spent="1"]').disabled = balance < SPENT_STEP;
}

export function wireSpent(root, onChange) {
  root.querySelectorAll('[data-spent]').forEach((button) => {
    button.addEventListener('click', () => onChange(Number(button.dataset.spent) * SPENT_STEP));
  });
}
