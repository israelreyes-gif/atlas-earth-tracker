// Evolución: gráfica de la ganancia diaria, estadísticas y registros.
import { filterByMonths, purchasePace } from '../calc.js';
import { lineChart } from '../chart.js';
import { formatDay, formatEuro, formatNumber } from '../format.js';
import { state, removeSnapshot } from '../store.js';
import { emptyHtml } from './empty.js';

const PERIODS = [
  { months: 3, label: '3 meses' },
  { months: 6, label: '6 meses' },
  { months: 12, label: '1 año' },
];

function statsHtml(list, now) {
  if (list.length === 0) return '';
  const first = list[0];
  const last = list[list.length - 1];
  const gained = last.parcels - first.parcels;
  const pace = purchasePace(list, now);
  return `
    <div class="grid2">
      <div class="stat"><span class="label">Al inicio</span><span class="value">${formatEuro(first.daily_income)}/día</span></div>
      <div class="stat"><span class="label">Hoy</span><span class="value">${formatEuro(last.daily_income)}/día</span></div>
      <div class="stat"><span class="label">Parcelas ganadas</span><span class="value">${gained > 0 ? '+' : ''}${formatNumber(gained)}</span></div>
      <div class="stat"><span class="label">Ritmo medio</span><span class="value">${formatNumber(pace, 1)} / mes</span></div>
    </div>`;
}

function recordsHtml(snapshots) {
  const rows = [...snapshots].reverse().slice(0, 20).map((s) => `
    <div class="record">
      <div class="info">
        <strong>${formatDay(new Date(s.taken_at))} ${new Date(s.taken_at).getFullYear()}</strong>
        <span class="muted">${formatNumber(s.parcels)} parcelas · ${formatEuro(s.daily_income)}/día · saldo ${formatEuro(s.balance)}</span>
      </div>
      <button class="link-btn" data-remove="${s.id}" aria-label="Borrar registro">Borrar</button>
    </div>`).join('');
  return `<section class="card"><span class="title">Registros</span>${rows}</section>`;
}

export function renderEvolution(container) {
  if (state.snapshots.length === 0) {
    container.innerHTML = emptyHtml('Tu evolución');
    return;
  }

  let months = 12;

  function draw() {
    const now = new Date();
    const list = filterByMonths(state.snapshots, months, now);
    const points = list.map((s) => ({ t: new Date(s.taken_at).getTime(), v: s.daily_income }));
    const label = list.length
      ? `Ganancia diaria de ${formatEuro(list[0].daily_income)} a ${formatEuro(list[list.length - 1].daily_income)}`
      : 'Sin registros';

    container.innerHTML = `
      <div>
        <h1>Tu evolución</h1>
        <span class="muted">Ganancia diaria según tus parcelas</span>
      </div>
      <div class="seg">
        ${PERIODS.map((p) => `<button type="button" data-months="${p.months}" aria-pressed="${p.months === months}">${p.label}</button>`).join('')}
      </div>
      <section class="card">
        <span class="title" style="font-size: 14px">€ al día</span>
        ${lineChart(points, label)}
      </section>
      ${statsHtml(list, now)}
      ${recordsHtml(state.snapshots)}`;

    container.querySelectorAll('[data-months]').forEach((button) => {
      button.addEventListener('click', () => {
        months = Number(button.dataset.months);
        draw();
      });
    });

    container.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('¿Borrar este registro?')) return;
        button.disabled = true;
        try {
          await removeSnapshot(Number(button.dataset.remove));
        } catch (error) {
          alert(`No se pudo borrar: ${error.message}`);
        }
        draw();
      });
    });
  }

  draw();
}
