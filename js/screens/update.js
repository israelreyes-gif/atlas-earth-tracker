// Formulario para apuntar un nuevo registro: parcelas por tipo (con + y −), ganancia diaria y saldo.
import { estimatedBalance, latestSnapshot } from '../calc.js';
import { escapeHtml } from '../html.js';
import { formatNumber, parseNumber, toInputValue } from '../format.js';
import { countsOf, totalsFromCounts } from '../parcel-types.js';
import { addSnapshot, state } from '../store.js';
import { stepperHtml, wireSteppers } from '../ui/stepper.js';

function typesHtml(types, counts, multiplier) {
  return `
    <section class="card" aria-label="Parcelas por tipo">
      <span class="title">Tus parcelas por tipo</span>
      ${types.map((type) => stepperHtml(type, counts[type.id] ?? 0, multiplier)).join('')}
      <div class="row between baseline">
        <span class="muted">Total</span>
        <span class="num" id="total" style="font-size: 20px"></span>
      </div>
    </section>`;
}

const NO_TYPES_HTML = `
  <section class="card">
    <span class="title">Aún no has definido tipos de parcela</span>
    <span class="muted">Añádelos en Ajustes para apuntar cuántas tienes de cada uno con + y −. Mientras tanto puedes escribir el total a mano.</span>
    <a class="btn btn-light btn-small" href="#settings">Ir a Ajustes</a>
  </section>`;

export function renderUpdate(container) {
  const last = latestSnapshot(state.snapshots);
  const types = state.parcelTypes;
  const multiplier = state.settings.income_multiplier;
  const withTypes = types.length > 0;
  const balance = last ? toInputValue(estimatedBalance(last, new Date()), 6) : '';
  const income = last ? toInputValue(last.daily_income, 6) : '';

  const manualParcels = withTypes ? '' : `
      <div class="field">
        <label for="parcels">Parcelas que tienes</label>
        <input id="parcels" inputmode="numeric" value="${escapeHtml(last ? String(last.parcels) : '')}" required>
      </div>`;

  container.innerHTML = `
    <h1>Actualizar mis parcelas</h1>
    <p class="muted">Copia los datos que ves ahora en Atlas Earth.</p>
    <form id="update-form" novalidate style="display: flex; flex-direction: column; gap: 14px">
      ${withTypes ? typesHtml(types, countsOf(last), multiplier) : NO_TYPES_HTML}
      <section class="card">
        ${manualParcels}
        <div class="field">
          <label for="income">Ganancia diaria ($)</label>
          <input id="income" inputmode="decimal" value="${escapeHtml(income)}" required>
          ${withTypes ? '<span class="muted small" id="income-hint"></span>' : ''}
        </div>
        <div class="field">
          <label for="balance">Ingresos acumulados ($)</label>
          <input id="balance" inputmode="decimal" value="${escapeHtml(balance)}" required>
        </div>
      </section>
      <p class="error" id="message" role="alert"></p>
      <button class="btn btn-dark" type="submit">Guardar</button>
      <a class="btn btn-light" href="#home">Cancelar</a>
    </form>`;

  const form = container.querySelector('#update-form');
  const message = container.querySelector('#message');
  let counts = countsOf(last);
  let incomeEdited = false;

  if (withTypes) {
    const totalEl = container.querySelector('#total');
    const hintEl = container.querySelector('#income-hint');
    form.income.addEventListener('input', () => { incomeEdited = true; });
    wireSteppers(container, (newCounts) => {
      counts = newCounts;
      const totals = totalsFromCounts(types, counts, multiplier);
      totalEl.textContent = `${formatNumber(totals.parcels)} parcelas`;
      hintEl.textContent = `Calculado con tus tipos: ${toInputValue(totals.daily, 6)} $ al día. Si el juego te muestra otra cifra, escríbela.`;
      if (!incomeEdited) form.income.value = toInputValue(totals.daily, 6);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const parcels = withTypes ? totalsFromCounts(types, counts, multiplier).parcels : parseNumber(form.parcels.value);
    const values = {
      parcels,
      daily_income: parseNumber(form.income.value),
      balance: parseNumber(form.balance.value),
    };
    if (withTypes) values.counts = counts;
    const valid = Number.isInteger(values.parcels) && values.parcels >= 0
      && values.daily_income >= 0 && values.balance >= 0;
    if (!valid) {
      message.textContent = 'Revisa los datos: las parcelas son un número entero y los importes, números.';
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    message.textContent = '';
    try {
      await addSnapshot({ taken_at: new Date().toISOString(), ...values });
      location.hash = '#home';
    } catch (error) {
      message.textContent = `No se pudo guardar: ${error.message}`;
      button.disabled = false;
    }
  });
}
