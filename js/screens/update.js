// Formulario para apuntar un registro nuevo.
// Con tipos de parcela: filas con − y + (la ganancia diaria sale sola).
// Sin tipos: parcelas y ganancia diaria a mano.
import { estimatedBalance, latestSnapshot } from '../calc.js';
import { escapeHtml } from '../html.js';
import { formatEuro, formatNumber, parseNumber, toInputValue } from '../format.js';
import { countsOf, totalsFromCounts } from '../parcel-types.js';
import { addSnapshot, state } from '../store.js';
import { stepperHtml, wireSteppers } from '../ui/stepper.js';

function stepperBlock(types, last) {
  const counts = countsOf(last);
  return `
    <div id="steppers">${types.map((type) => stepperHtml(type, counts[type.id] ?? 0)).join('')}</div>
    <div class="row between baseline">
      <span class="muted" id="total"></span>
      <a href="#settings">Editar tipos</a>
    </div>`;
}

function manualBlock(last) {
  const parcels = last ? String(last.parcels) : '';
  const income = last ? toInputValue(last.daily_income) : '';
  return `
    <p class="muted small">Define tus tipos de parcela en <a href="#settings">Ajustes</a> para sumarlas con + y −.</p>
    <div class="field">
      <label for="parcels">Parcelas que tienes</label>
      <input id="parcels" inputmode="numeric" value="${escapeHtml(parcels)}" required>
    </div>
    <div class="field">
      <label for="income">Ganancia diaria (€)</label>
      <input id="income" inputmode="decimal" value="${escapeHtml(income)}" required>
    </div>`;
}

export function renderUpdate(container) {
  const last = latestSnapshot(state.snapshots);
  const types = state.settings.parcel_types;
  const useTypes = types.length > 0;
  const balance = last ? toInputValue(estimatedBalance(last, new Date())) : '';

  container.innerHTML = `
    <h1>Actualizar mis parcelas</h1>
    <p class="muted">Copia los datos que ves ahora en Atlas Earth.</p>
    <form class="card" id="update-form" novalidate>
      ${useTypes ? stepperBlock(types, last) : manualBlock(last)}
      <div class="field">
        <label for="balance">Saldo actual (€)</label>
        <input id="balance" inputmode="decimal" value="${escapeHtml(balance)}" required>
      </div>
      <p class="error" id="message" role="alert"></p>
      <button class="btn btn-dark" type="submit">Guardar</button>
      <a class="btn btn-light" href="#home">Cancelar</a>
    </form>`;

  const form = container.querySelector('#update-form');
  const message = container.querySelector('#message');
  let counts = {};

  if (useTypes) {
    const totalEl = container.querySelector('#total');
    wireSteppers(container.querySelector('#steppers'), (newCounts) => {
      counts = newCounts;
      const totals = totalsFromCounts(types, counts);
      totalEl.textContent = `${formatNumber(totals.parcels)} parcelas · ${formatEuro(totals.daily)} al día`;
    });
  }

  function readValues() {
    const balanceValue = parseNumber(form.balance.value);
    if (useTypes) {
      const totals = totalsFromCounts(types, counts);
      return { parcels: totals.parcels, daily_income: totals.daily, balance: balanceValue, counts };
    }
    return {
      parcels: parseNumber(form.parcels.value),
      daily_income: parseNumber(form.income.value),
      balance: balanceValue,
    };
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = readValues();
    const valid = Number.isInteger(values.parcels) && values.parcels >= 0
      && values.daily_income >= 0 && values.balance >= 0;
    if (!valid) {
      message.textContent = 'Revisa los datos: las parcelas, en número entero, y los importes con números.';
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
