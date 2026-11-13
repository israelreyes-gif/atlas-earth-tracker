// Configuración: parcelas, insignias, boosts, invertido y retirado, con − y +.
import { dailyIncome, estimate } from '../calc.js';
import { currentMultiplier, state } from '../store.js';
import { createEditor } from '../editor.js';
import { badgesHtml, refreshBadges, wireBadges } from '../ui/badges.js';
import { boostsHtml, refreshBoosts, wireBoosts } from '../ui/boosts.js';
import { parcelRowsHtml, refreshParcelRows, wireParcelRows } from '../ui/parcel-rows.js';
import { refreshSpent, spentHtml, wireSpent } from '../ui/spent.js';
import { refreshWithdrawn, withdrawnHtml, wireWithdrawn } from '../ui/withdrawn.js';

const BACK = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';

export function renderSettings(container) {
  container.innerHTML = `
    <div class="row">
      <a class="icon-btn" href="#home" aria-label="Volver al inicio">${BACK}</a>
      <h1>Configuración</h1>
    </div>
    ${parcelRowsHtml(state.types, currentMultiplier())}
    ${badgesHtml()}
    ${boostsHtml()}
    ${spentHtml()}
    ${withdrawnHtml()}
    <p class="muted small" id="status" role="status"></p>
    <button class="btn btn-light btn-small" type="button" id="retry" hidden>Reintentar guardar</button>`;

  // Cifras que cambian con el tiempo (cuenta atrás del boost, saldo para gastar).
  function tickAll() {
    const multiplier = currentMultiplier();
    refreshBoosts(container, state.account, dailyIncome(state.types, multiplier));
    const value = estimate(state.account, state.types, multiplier, new Date());
    refreshSpent(container, value.spent, value.balance);
    refreshWithdrawn(container, value.withdrawn, value.balance);
  }

  function refreshAll() {
    refreshParcelRows(container, state.types, currentMultiplier());
    refreshBadges(container, state.account.badges, state.levels);
    tickAll();
  }

  const editor = createEditor({
    status: container.querySelector('#status'),
    retry: container.querySelector('#retry'),
    onChange: refreshAll,
  });

  wireParcelRows(container, editor.changeParcels);
  wireBadges(container, () => state.account.badges, editor.changeBadges);
  wireBoosts(container, editor.changeBoost);
  wireSpent(container, editor.changeSpent);
  wireWithdrawn(container, editor.changeWithdrawn);
  container.querySelector('#retry').addEventListener('click', editor.save);

  refreshAll();
  const tick = setInterval(tickAll, 1000);
  return () => {
    clearInterval(tick);
    editor.flush();
  };
}
