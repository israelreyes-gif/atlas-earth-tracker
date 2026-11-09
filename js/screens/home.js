// Inicio: dinero arriba (en directo), ganancia al día y al mes, parcelas por tipo e insignias, con + y −.
import { dailyIncome, estimate, monthlyIncome, totalParcels } from '../calc.js';
import { formatDollar, formatNumber } from '../format.js';
import { currentMultiplier, persist, state } from '../store.js';
import { badgesHtml, refreshBadges, wireBadges } from '../ui/badges.js';
import { heroHtml, tickHero } from '../ui/hero.js';
import { refreshTiles, tilesHtml, wireTiles } from '../ui/tiles.js';

const SAVE_DELAY_MS = 800;

export function renderHome(container) {
  container.innerHTML = `
    <h1>Atlas Tracker</h1>
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
    ${tilesHtml(state.types, currentMultiplier())}
    ${badgesHtml()}
    <p class="muted small" id="status" role="status"></p>
    <button class="btn btn-light btn-small" type="button" id="retry" hidden>Reintentar guardar</button>`;

  const statusEl = container.querySelector('#status');
  const retryButton = container.querySelector('#retry');
  let timer = null;
  let queue = Promise.resolve();

  function refreshAll() {
    const multiplier = currentMultiplier();
    container.querySelector('#day').textContent = formatDollar(dailyIncome(state.types, multiplier), 5);
    container.querySelector('#month').textContent = formatDollar(monthlyIncome(state.types, multiplier), 4);
    container.querySelector('#total-parcels').textContent = `${formatNumber(totalParcels(state.types))} en total`;
    refreshTiles(container, state.types, multiplier);
    refreshBadges(container, state.account.badges, state.levels);
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

  // Se fija el dinero que llevabas hasta ahora y desde aquí cuenta con el nuevo ritmo.
  function freezeMoney() {
    const now = new Date();
    const value = estimate(state.account, state.types, currentMultiplier(), now);
    state.account = { ...state.account, total_earned: value.total, balance: value.balance, updated_at: now.toISOString() };
  }

  function afterChange() {
    refreshAll();
    tickHero(container);
    statusEl.textContent = 'Cambios sin guardar…';
    clearTimeout(timer);
    timer = setTimeout(save, SAVE_DELAY_MS);
  }

  function changeParcels(typeId, delta) {
    const type = state.types.find((item) => item.id === typeId);
    const next = Math.max(0, type.count + delta);
    if (next === type.count) return;
    freezeMoney();
    type.count = next;
    afterChange();
  }

  function changeBadges(delta) {
    freezeMoney();
    state.account.badges += delta;
    afterChange();
  }

  wireTiles(container, changeParcels);
  wireBadges(container, () => state.account.badges, changeBadges);
  retryButton.addEventListener('click', save);
  refreshAll();
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
