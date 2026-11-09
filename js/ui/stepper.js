// Fila con − cantidad + para un tipo de parcela. La cantidad también se puede escribir.
import { dailyPerParcel } from '../parcel-types.js';
import { formatDollar } from '../format.js';
import { escapeHtml } from '../html.js';

export function stepperHtml(type, amount, multiplier) {
  const name = escapeHtml(type.name);
  return `
    <div class="type-line" data-type="${escapeHtml(type.id)}">
      <div class="type-name-box">
        <span class="title">${name}</span>
        <span class="muted small">${formatDollar(dailyPerParcel(type, multiplier), 6)} al día cada una</span>
      </div>
      <div class="stepper type-stepper">
        <button type="button" class="step" data-step="-1" aria-label="Quitar 1 de ${name}">−</button>
        <input class="step-input" inputmode="numeric" value="${amount}" aria-label="Cantidad de ${name}">
        <button type="button" class="step" data-step="1" aria-label="Añadir 1 de ${name}">+</button>
      </div>
    </div>`;
}

// Conecta los botones. onChange recibe { idTipo: cantidad } cada vez que algo cambia.
export function wireSteppers(root, onChange) {
  const rows = root.querySelectorAll('.type-line');

  function readAll() {
    const counts = {};
    rows.forEach((row) => {
      const amount = Number(row.querySelector('.step-input').value.trim());
      counts[row.dataset.type] = Number.isInteger(amount) && amount >= 0 ? amount : 0;
    });
    return counts;
  }

  rows.forEach((row) => {
    const input = row.querySelector('.step-input');
    row.querySelectorAll('.step').forEach((button) => {
      button.addEventListener('click', () => {
        const current = Number(input.value.trim()) || 0;
        input.value = Math.max(0, current + Number(button.dataset.step));
        onChange(readAll());
      });
    });
    input.addEventListener('input', () => onChange(readAll()));
  });

  onChange(readAll());
}
