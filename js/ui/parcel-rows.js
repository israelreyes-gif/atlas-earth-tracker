// Tarjeta de configuración de parcelas: una línea por tipo con − y +, y lo que gana cada tipo al día.
import { dailyIncome } from '../calc.js';
import { formatDollar, formatNumber } from '../format.js';
import { escapeHtml } from '../html.js';
import { styleOf } from '../type-style.js';

export function parcelRowsHtml(types, multiplier) {
  return `
    <section class="card" aria-label="Parcelas">
      <h2>Parcelas</h2>
      ${types.map((type) => {
        const { color } = styleOf(type.id);
        const name = escapeHtml(type.name);
        return `
          <div class="parcel-row" data-type="${escapeHtml(type.id)}">
            <div class="badges-info">
              <span class="tile-name" style="color: ${color}; font-size: 15px">${name}</span>
              <span class="muted small parcel-income">${formatDollar(dailyIncome([type], multiplier), 5)} al día</span>
            </div>
            <div class="badges-controls">
              <button type="button" class="tile-btn" data-delta="-1" aria-label="Quitar una parcela ${name}">−</button>
              <span class="badges-count num parcel-count">${formatNumber(type.count)}</span>
              <button type="button" class="tile-btn" data-delta="1" aria-label="Añadir una parcela ${name}">+</button>
            </div>
          </div>`;
      }).join('')}
    </section>`;
}

export function refreshParcelRows(root, types, multiplier) {
  for (const type of types) {
    const row = root.querySelector(`.parcel-row[data-type="${type.id}"]`);
    row.querySelector('.parcel-count').textContent = formatNumber(type.count);
    row.querySelector('.parcel-income').textContent = `${formatDollar(dailyIncome([type], multiplier), 5)} al día`;
  }
}

// onChange recibe (idTipo, +1 o −1).
export function wireParcelRows(root, onChange) {
  root.querySelectorAll('.parcel-row .tile-btn').forEach((button) => {
    button.addEventListener('click', () => {
      onChange(button.closest('.parcel-row').dataset.type, Number(button.dataset.delta));
    });
  });
}
