// Fila de cuatro fichas de color con el número de parcelas de cada tipo (solo lectura).
import { formatNumber } from '../format.js';
import { escapeHtml } from '../html.js';
import { styleOf } from '../type-style.js';

export function parcelChipsHtml(types) {
  return `<div class="chips">${types.map((type) => {
    const { color, soft } = styleOf(type.id);
    return `
      <div class="tile chip" style="background: ${soft}" data-type="${escapeHtml(type.id)}">
        <span class="tile-count" style="color: ${color}">${formatNumber(type.count)}</span>
        <span class="tile-name" style="color: ${color}">${escapeHtml(type.name).toUpperCase()}</span>
      </div>`;
  }).join('')}</div>`;
}

export function refreshParcelChips(root, types) {
  for (const type of types) {
    root.querySelector(`.chip[data-type="${type.id}"] .tile-count`).textContent = formatNumber(type.count);
  }
}
