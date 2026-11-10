// Dos fichas del inicio: insignias y boost activo (solo lectura).
import { bonusFor, boostRemaining } from '../calc.js';
import { formatNumber } from '../format.js';
import { clock } from './boosts.js';

export function summaryHtml() {
  return `
    <div class="grid2">
      <div class="stat"><span class="label">Insignias</span><span class="value" id="sum-badges"></span><span class="muted small" id="sum-badges-bonus"></span></div>
      <div class="stat"><span class="label">Boost activo</span><span class="value" id="sum-boost"></span><span class="muted small" id="sum-boost-left"></span></div>
    </div>`;
}

// Se llama cada segundo: la cuenta atrás del boost sigue en marcha.
export function refreshSummary(root, account, levels) {
  const bonus = Math.round(bonusFor(account.badges, levels) * 100);
  const left = boostRemaining(account, new Date());
  root.querySelector('#sum-badges').textContent = formatNumber(account.badges);
  root.querySelector('#sum-badges-bonus').textContent = `+${formatNumber(bonus)} % de aumento`;
  root.querySelector('#sum-boost').textContent = left > 0 ? `x${account.boost_type}` : 'Ninguno';
  root.querySelector('#sum-boost-left').textContent = left > 0 ? `Quedan ${clock(left)}` : 'Sin boost';
}
