// Tarjeta de lo retirado: apuntar con − y + lo que se retira del juego (1 $ por pulsación).
import { formatDollar } from '../format.js';

export const WITHDRAWN_STEP = 1;

export function withdrawnHtml() {
  return `
    <section class="badges" aria-label="Retirado">
      <div class="badges-info">
        <span class="title">Retirado</span>
        <span class="muted small">${WITHDRAWN_STEP} $ por pulsación</span>
      </div>
      <div class="badges-controls">
        <button type="button" class="tile-btn" data-withdrawn="-1" aria-label="Quitar ${WITHDRAWN_STEP} dólar de retirado">−</button>
        <span class="num badges-count" id="withdrawn-value"></span>
        <button type="button" class="tile-btn" data-withdrawn="1" aria-label="Añadir ${WITHDRAWN_STEP} dólar de retirado">+</button>
      </div>
    </section>`;
}

// withdrawn: retirado; balance: saldo ahora. Bloquea − sin retiradas y + sin saldo para retirar.
export function refreshWithdrawn(root, withdrawn, balance) {
  root.querySelector('#withdrawn-value').textContent = formatDollar(withdrawn, 0);
  root.querySelector('[data-withdrawn="-1"]').disabled = withdrawn < WITHDRAWN_STEP;
  root.querySelector('[data-withdrawn="1"]').disabled = balance < WITHDRAWN_STEP;
}

export function wireWithdrawn(root, onChange) {
  root.querySelectorAll('[data-withdrawn]').forEach((button) => {
    button.addEventListener('click', () => onChange(Number(button.dataset.withdrawn) * WITHDRAWN_STEP));
  });
}
