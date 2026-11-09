// Inicio: dinero arriba (en directo), ganancia al día y al mes, y parcelas por tipo con + y −.
import { dailyIncome, estimate, monthlyIncome, totalParcels } from '../calc.js';
import { formatDollar, formatNumber } from '../format.js';
import { persist, state } from '../store.js';
import { heroHtml, tickHero } from '../ui/hero.js';
import { refreshTiles, tilesHtml, wireTiles } from '../ui/tiles.js';

const GEAR = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>';
const SAVE_DELAY_MS = 800;

export function renderHome(container) {
  container.innerHTML = `
    <div class="row between baseline">
      <h1>Atlas Tracker</h1>
      <a class="icon-btn" href="#settings" aria-label="Ajustes">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${GEAR}</svg>
      </a>
    </div>
    ${state.offline ? '<p class="muted"><span class="pill">Sin conexión · datos guardados</span></p>' : ''}
    ${heroHtml()}
    <div class="grid2">
      <div class="stat"><span class="label">Ganas al día</span><span class="value" id="day"></span></div>
      <div class="stat"><span class="label">Ganas al mes</span><span class="value" id="month"></span></div>
    </div>
    <div class="row between baseline">
      <h2>Mis parcelas</h2>
      <span class="muted" id="total-parcels"></span>
    </div>
    ${tilesHtml(state.types)}
    <p class="muted small" id="status" role="status"></p>
    <button class="btn btn-light btn-small" type="button" id="retry" hidden>Reintentar guardar</button>`;

  const statusEl = container.querySelector('#status');
  const retryButton = container.querySelector('#retry');
  let timer = null;
  let queue = Promise.resolve();

  function refreshStats() {
    container.querySelector('#day').textContent = formatDollar(dailyIncome(state.types), 5);
    container.querySelector('#month').textContent = formatDollar(monthlyIncome(state.types), 4);
    container.querySelector('#total-parcels').textContent = `${formatNumber(totalParcels(state.types))} en total`;
    refreshTiles(container, state.types);
  }

  // Guarda en orden: cada guardado espera al anterior.
  function save() {
    timer = null;
    statusEl.textContent = 'Guardando…';
    retryButton.hidden = true;
    queue = queue.then(async () => {
      try {
        await persist();
        statusEl.textContent = 'Guardado';
      } catch (error) {
        statusEl.textContent = `No se pudo guardar: ${error.message}`;
        retryButton.hidden = false;
      }
    });
  }

  function change(typeId, delta) {
    const type = state.types.find((item) => item.id === typeId);
    const next = Math.max(0, type.count + delta);
    if (next === type.count) return;

    // Se fija el dinero que llevabas hasta ahora y desde aquí cuenta con el nuevo ritmo.
    const now = new Date();
    const value = estimate(state.account, state.types, now);
    state.account = { total_earned: value.total, balance: value.balance, updated_at: now.toISOString() };
    type.count = next;

    refreshStats();
    tickHero(container);
    statusEl.textContent = 'Cambios sin guardar…';
    clearTimeout(timer);
    timer = setTimeout(save, SAVE_DELAY_MS);
  }

  wireTiles(container, change);
  retryButton.addEventListener('click', save);
  refreshStats();
  tickHero(container);
  const tick = setInterval(() => tickHero(container), 1000);

  return () => {
    clearInterval(tick);
    if (timer) {
      clearTimeout(timer);
      persist().catch(() => {});
    }
  };
}
