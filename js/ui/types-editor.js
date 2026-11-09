// Editor de tipos de parcela (nombre + ganancia por segundo, como en el juego) para Ajustes.
import { parseNumber } from '../format.js';
import { escapeHtml } from '../html.js';
import { newTypeId, rateToText } from '../parcel-types.js';

function rowHtml(type) {
  return `
    <div class="type-row" data-id="${escapeHtml(type.id)}">
      <div class="field">
        <label>Nombre del tipo</label>
        <input class="type-name" placeholder="Por ejemplo: Común" value="${escapeHtml(type.name ?? '')}">
      </div>
      <div class="field">
        <label>$ por segundo de cada parcela (como lo ves en el juego)</label>
        <input class="type-rate" inputmode="decimal" placeholder="0,0000000011" value="${escapeHtml(rateToText(type.rate))}">
      </div>
      <button type="button" class="link-btn" data-remove-type>Quitar este tipo</button>
    </div>`;
}

export function typesEditorHtml(types) {
  return `
    <section class="card" aria-label="Tipos de parcela">
      <span class="title">Tipos de parcela</span>
      <span class="muted small">Un tipo por cada clase de parcela que tengas. La app pasa lo que da por segundo a lo que da al día.</span>
      <div id="type-rows">${types.map(rowHtml).join('')}</div>
      <button type="button" class="btn btn-light btn-small" id="add-type">+ Añadir tipo</button>
    </section>`;
}

export function wireTypesEditor(root) {
  const list = root.querySelector('#type-rows');

  root.querySelector('#add-type').addEventListener('click', () => {
    list.insertAdjacentHTML('beforeend', rowHtml({ id: newTypeId(), name: '' }));
    list.lastElementChild.querySelector('.type-name').focus();
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-type]');
    if (button) button.closest('.type-row').remove();
  });

  // Devuelve { types } o { error }. Las filas totalmente vacías se ignoran.
  return function readTypes() {
    const types = [];
    for (const row of list.querySelectorAll('.type-row')) {
      const name = row.querySelector('.type-name').value.trim();
      const rateText = row.querySelector('.type-rate').value.trim();
      if (name === '' && rateText === '') continue;
      const rate = parseNumber(rateText);
      if (name === '' || !(rate >= 0)) {
        return { error: 'Revisa los tipos: cada uno necesita nombre y un número de $ por segundo.' };
      }
      types.push({ id: row.dataset.id, name, rate });
    }
    return { types };
  };
}
