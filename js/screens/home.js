// Inicio: contador de ganancia diaria y próximo canjeo.
import { dayFractionElapsed, daysToReach, addDays, earnedToday, estimatedBalance, incomePerParcel, latestSnapshot } from '../calc.js';
import { formatDay, formatDays, formatDollar, formatNumber, formatToday } from '../format.js';
import { countsOf, dailyPerParcel } from '../parcel-types.js';
import { escapeHtml } from '../html.js';
import { state } from '../store.js';
import { emptyHtml } from './empty.js';

const GEAR = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>';

export function renderHome(container) {
  const snapshot = latestSnapshot(state.snapshots);
  if (!snapshot) {
    container.innerHTML = emptyHtml('Atlas Tracker');
    return;
  }

  const threshold = state.settings.withdraw_threshold;
  const perParcel = incomePerParcel(snapshot);
  const daily = snapshot.daily_income;
  const counts = countsOf(snapshot);
  const rows = state.parcelTypes.filter((type) => (counts[type.id] ?? 0) > 0);
  const breakdown = rows.length ? `
    <section class="card" aria-label="Parcelas por tipo">
      <span class="title">Tus parcelas por tipo</span>
      ${rows.map((type) => `<div class="breakdown-row"><span>${escapeHtml(type.name)}: ${formatNumber(counts[type.id])}</span><span class="muted">${formatDollar(counts[type.id] * dailyPerParcel(type, state.settings.income_multiplier), 4)} al día</span></div>`).join('')}
    </section>` : '';

  container.innerHTML = `
    <div class="row between baseline">
      <h1>Atlas Tracker</h1>
      <div class="row">
        <span class="muted">${formatToday(new Date())}</span>
        <a class="icon-btn" href="#settings" aria-label="Ajustes">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${GEAR}</svg>
        </a>
      </div>
    </div>
    ${state.offline ? '<p class="muted"><span class="pill">Sin conexión · datos guardados</span></p>' : ''}

    <section class="hero" aria-label="Ganancia diaria">
      <span class="soft">Ganas al día</span>
      <div class="row baseline">
        <span class="big">${formatDollar(daily)}</span>
        <span class="unit">/día</span>
      </div>
      <span class="soft">${formatNumber(snapshot.parcels)} parcelas · ${formatDollar(perParcel, 4)} por parcela</span>
      <div class="divider"></div>
      <div class="row between baseline">
        <span class="soft">Hoy llevas</span>
        <span class="num" id="earned" style="font-size: 20px"></span>
      </div>
      <div class="bar"><i id="earned-bar"></i></div>
    </section>

    <div class="grid3">
      <div class="stat"><span class="value">${formatNumber(snapshot.parcels)}</span><span class="label">Parcelas</span></div>
      <div class="stat"><span class="value">${formatDollar(daily * 30)}</span><span class="label">Al mes</span></div>
      <div class="stat"><span class="value">${formatDollar(daily * 365, 0)}</span><span class="label">Al año</span></div>
    </div>

    ${breakdown}

    <a class="card card-link" href="#purchases" aria-label="Próximo canjeo: ver ingresos acumulados y opciones de cobro">
      <div class="row between">
        <span class="title">Próximo canjeo</span>
        <span class="pill">Objetivo ${formatDollar(threshold, Number.isInteger(threshold) ? 0 : 2)}</span>
      </div>
      <div class="row between baseline">
        <span class="num" id="balance" style="font-size: 24px"></span>
        <span class="muted" id="missing"></span>
      </div>
      <div class="bar"><i id="balance-bar"></i></div>
      <span class="muted" id="eta"></span>
      <span class="muted small">Ingresos acumulados estimados desde tu última actualización (${formatDay(new Date(snapshot.taken_at))}) · Toca para cobrar o comprar</span>
    </a>

    <a class="btn btn-dark" href="#update" style="margin-top: auto">Actualizar mis parcelas</a>`;

  const earnedEl = container.querySelector('#earned');
  const earnedBar = container.querySelector('#earned-bar');
  const balanceEl = container.querySelector('#balance');
  const balanceBar = container.querySelector('#balance-bar');
  const missingEl = container.querySelector('#missing');
  const etaEl = container.querySelector('#eta');

  function tick() {
    const now = new Date();
    earnedEl.textContent = formatDollar(earnedToday(snapshot, now), 4);
    earnedBar.style.width = `${dayFractionElapsed(now) * 100}%`;

    const balance = estimatedBalance(snapshot, now);
    balanceEl.textContent = formatDollar(balance);
    balanceBar.style.width = `${Math.min(1, balance / threshold) * 100}%`;

    const days = daysToReach(balance, threshold, daily);
    if (days === 0) {
      missingEl.textContent = '¡Ya puedes canjear!';
      etaEl.textContent = 'Has llegado al mínimo para canjear';
    } else {
      missingEl.textContent = `faltan ${formatDollar(threshold - balance)}`;
      etaEl.textContent = Number.isFinite(days)
        ? `A este ritmo llegas el ${formatDay(addDays(now, days))} (en ${formatDays(days)})`
        : 'Sin ganancias no se llega al mínimo';
    }
  }

  tick();
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}
