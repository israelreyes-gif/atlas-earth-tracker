// Inicio: dinero arriba (en directo), ganancia al día y al mes, parcelas por tipo e insignias, con + y −.
import { BOOST_MAX_SECONDS, BOOST_STEP_SECONDS, boostRemaining, dailyIncome, estimate, freezeAccount, monthlyIncome, totalParcels } from '../calc.js';
import { formatDollar, formatNumber } from '../format.js';
import { currentMultiplier, persist, state } from '../store.js';
import { badgesHtml, refreshBadges, wireBadges } from '../ui/badges.js';
import { boostsHtml, refreshBoosts, wireBoosts } from '../ui/boosts.js';
import { heroHtml, tickHero } from '../ui/hero.js';
import { refreshSpent, spentHtml, wireSpent } from '../ui/spent.js';
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
    ${boostsHtml()}
    ${spentHtml()}
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

  // Se fija el dinero (y lo que queda de boost) hasta ahora y desde aquí cuenta con el nuevo ritmo.
  function freezeMoney() {
    state.account = freezeAccount(state.account, state.types, currentMultiplier(), new Date());
  }

  // Cada segundo: cifras de dinero y boosts.
  function tickAll() {
    tickHero(container);
    refreshBoosts(container, state.account, dailyIncome(state.types, currentMultiplier()));
    const value = estimate(state.account, state.types, currentMultiplier(), new Date());
    refreshSpent(container, value.spent, value.balance);
  }

  function afterChange() {
    refreshAll();
    tickAll();
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

  // + suma una hora al boost (solo si no hay otro tipo activo); − quita una hora.
  function changeBoost(type, delta) {
    freezeMoney();
    const left = boostRemaining(state.account, new Date(state.account.updated_at));
    const active = left > 0 ? state.account.boost_type : 0;
    if (delta > 0 && active !== 0 && active !== type) return;
    if (delta < 0 && active !== type) return;
    const next = Math.max(0, left + delta * BOOST_STEP_SECONDS);
    if (next > BOOST_MAX_SECONDS) return;
    state.account = { ...state.account, boost_type: next > 0 ? type : 0, boost_seconds: next };
    afterChange();
  }

  // Apunta un gasto (+) o lo corrige (−): el total no cambia, el saldo baja o sube.
  function changeSpent(delta) {
    freezeMoney();
    const balance = state.account.total_earned - state.account.spent;
    if (delta > 0 && balance < delta) return;
    const next = Math.max(0, state.account.spent + delta);
    if (next === state.account.spent) return;
    state.account = { ...state.account, spent: next };
    afterChange();
  }

  wireTiles(container, changeParcels);
  wireSpent(container, changeSpent);
  wireBoosts(container, changeBoost);
  wireBadges(container, () => state.account.badges, changeBadges);
  retryButton.addEventListener('click', save);
  refreshAll();
  tickAll();
  const tick = setInterval(tickAll, 1000);

  return () => {
    clearInterval(tick);
    if (timer) {
      clearTimeout(timer);
      persist().catch(() => {});
    }
  };
}
