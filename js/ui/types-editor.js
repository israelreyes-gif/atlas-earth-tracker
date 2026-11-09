// Editor de tipos de parcela (nombre + ganancia diaria de cada parcela) para Ajustes.
import { parseNumber } from '../format.js';
import { escapeHtml } from '../html.js';
import { newTypeId } from '../parcel-types.js';

function rowHtml(type) {
  const income = type.income === undefined ? '' : String(type.income).replace('.', ',');
  return `
    <div class="type-row" data-id="${escapeHtml(type.id)}">
      <input class="type-name" placeholder="Nombre del tipo" value="${escapeHtml(type.name ?? '')}" aria-label="Nombre del tipo">
      <div class="row">
        <input class="type-income" inputmode="decimal" placeholder="€ al día cada una" value="${escapeHtml(income)}" aria-label="Ganancia al día de cada parcela de este tipo (€)">
        <button type="button" class="link-btn" data-remove-type>Quitar</button>
      </div>
    </div>`;
}

export function typesEditorHtml(types) {
  return `
    <section class="card" aria-label="Tipos de parcela">
      <span class="title">Tipos de parcela</span>
      <span class="muted small">Apunta cada tipo y lo que da al día cada parcela de ese tipo.</span>
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
      const incomeText = row.querySelector('.type-income').value.trim();
      if (name === '' && incomeText === '') continue;
      const income = parseNumber(incomeText);
      if (name === '' || !(income >= 0)) {
        return { error: 'Revisa los tipos: cada uno necesita nombre y ganancia al día (un número).' };
      }
      types.push({ id: row.dataset.id, name, income });
    }
    return { types };
  };
}
