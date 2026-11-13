// Inicio: resumen de la cuenta. Dinero arriba (en directo), ganancia al día y al mes, parcelas, insignias y boost.
import { buildAdvice } from '../advice/advice.js';
import { dailyIncome, estimate, monthlyIncome, totalParcels } from '../calc.js';
import { formatDollar, formatNumber } from '../format.js';
import { currentMultiplier, state } from '../store.js';
import { adviceHtml, refreshAdvice } from '../ui/advice-card.js';
import { heroHtml, tickHero } from '../ui/hero.js';
import { parcelChipsHtml } from '../ui/parcel-chips.js';
import { refreshSummary, summaryHtml } from '../ui/summary.js';

const CHART = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>';
const GEAR = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';

export function renderHome(container) {
  const multiplier = currentMultiplier();
  container.innerHTML = `
    <div class="row between">
      <h1>Atlas Tracker</h1>
      <div class="row" style="gap: 0">
        <a class="icon-btn" href="#progress" aria-label="Progresión">${CHART}</a>
        <a class="icon-btn" href="#settings" aria-label="Configuración">${GEAR}</a>
      </div>
    </div>
    ${state.offline ? '<p class="muted"><span class="pill">Sin conexión · datos guardados</span></p>' : ''}
    ${heroHtml()}
    <div class="grid2">
      <div class="stat"><span class="label">Ganas al día</span><span class="value">${formatDollar(dailyIncome(state.types, multiplier), 5)}</span></div>
      <div class="stat"><span class="label">Ganas al mes</span><span class="value">${formatDollar(monthlyIncome(state.types, multiplier), 4)}</span></div>
    </div>
    <div class="row between baseline">
      <h2>Mis parcelas</h2>
      <span class="muted">${formatNumber(totalParcels(state.types))} en total</span>
    </div>
    ${parcelChipsHtml(state.types)}
    ${summaryHtml()}
    ${adviceHtml()}`;

  // Cada segundo: cifras de dinero y cuenta atrás del boost.
  function tickAll() {
    tickHero(container);
    refreshSummary(container, state.account, state.levels);
    const value = estimate(state.account, state.types, currentMultiplier(), new Date());
    refreshAdvice(container, buildAdvice({
      types: state.types,
      levels: state.levels,
      badges: state.account.badges,
      balance: value.balance,
      multiplier: currentMultiplier(),
    }));
  }

  tickAll();
  const tick = setInterval(tickAll, 1000);
  return () => clearInterval(tick);
}
