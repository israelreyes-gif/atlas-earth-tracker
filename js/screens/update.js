// Formulario para apuntar un nuevo registro (parcelas, ganancia diaria y saldo).
import { estimatedBalance, latestSnapshot } from '../calc.js';
import { escapeHtml } from '../html.js';
import { parseNumber, toInputValue } from '../format.js';
import { addSnapshot, state } from '../store.js';

export function renderUpdate(container) {
  const last = latestSnapshot(state.snapshots);
  const parcels = last ? String(last.parcels) : '';
  const income = last ? toInputValue(last.daily_income) : '';
  const balance = last ? toInputValue(estimatedBalance(last, new Date())) : '';

  container.innerHTML = `
    <h1>Actualizar mis parcelas</h1>
    <p class="muted">Copia los datos que ves ahora en Atlas Earth.</p>
    <form class="card" id="update-form" novalidate>
      <div class="field">
        <label for="parcels">Parcelas que tienes</label>
        <input id="parcels" inputmode="numeric" value="${escapeHtml(parcels)}" required>
      </div>
      <div class="field">
        <label for="income">Ganancia diaria ($)</label>
        <input id="income" inputmode="decimal" value="${escapeHtml(income)}" required>
      </div>
      <div class="field">
        <label for="balance">Saldo actual ($)</label>
        <input id="balance" inputmode="decimal" value="${escapeHtml(balance)}" required>
      </div>
      <p class="error" id="message" role="alert"></p>
      <button class="btn btn-dark" type="submit">Guardar</button>
      <a class="btn btn-light" href="#home">Cancelar</a>
    </form>`;

  const form = container.querySelector('#update-form');
  const message = container.querySelector('#message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = {
      parcels: parseNumber(form.parcels.value),
      daily_income: parseNumber(form.income.value),
      balance: parseNumber(form.balance.value),
    };
    const valid = Number.isInteger(values.parcels) && values.parcels >= 0
      && values.daily_income >= 0 && values.balance >= 0;
    if (!valid) {
      message.textContent = 'Revisa los datos: parcelas entero y los importes con números.';
      return;
    }

    const button = form.querySelector('button');
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
