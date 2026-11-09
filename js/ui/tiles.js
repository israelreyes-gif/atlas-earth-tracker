// Cuadrícula de colores con las parcelas de cada tipo y sus botones − y +.
import { dailyIncome } from '../calc.js';
import { formatDollar, formatNumber } from '../format.js';
import { escapeHtml } from '../html.js';
import { styleOf } from '../type-style.js';

export function tilesHtml(types) {
  return `<div class="tiles">${types.map((type) => {
    const { color, soft } = styleOf(type.id);
    const name = escapeHtml(type.name);
    return `
      <div class="tile" style="background: ${soft}" data-type="${escapeHtml(type.id)}">
        <span class="tile-count" style="color: ${color}">${formatNumber(type.count)}</span>
        <span class="tile-name" style="color: ${color}">${name.toUpperCase()}</span>
        <span class="muted small tile-income">${formatDollar(dailyIncome([type]), 5)} al día</span>
        <div class="tile-buttons">
          <button type="button" class="tile-btn" data-delta="-1" aria-label="Quitar una parcela ${name}">−</button>
          <button type="button" class="tile-btn" data-delta="1" aria-label="Añadir una parcela ${name}">+</button>
        </div>
      </div>`;
  }).join('')}</div>`;
}

// Actualiza los números de las tarjetas sin volver a dibujarlas.
export function refreshTiles(root, types) {
  for (const type of types) {
    const tile = root.querySelector(`.tile[data-type="${type.id}"]`);
    tile.querySelector('.tile-count').textContent = formatNumber(type.count);
    tile.querySelector('.tile-income').textContent = `${formatDollar(dailyIncome([type]), 5)} al día`;
  }
}

// onChange recibe (idTipo, +1 o −1).
export function wireTiles(root, onChange) {
  root.querySelectorAll('.tile-btn').forEach((button) => {
    button.addEventListener('click', () => {
      onChange(button.closest('.tile').dataset.type, Number(button.dataset.delta));
    });
  });
}
