// Tarjeta de boosts: x20 y x50 con − y + (1 hora por pulsación, hasta 5 h). Solo uno activo a la vez.
import { BOOST_MAX_SECONDS, BOOST_STEP_SECONDS, BOOST_TYPES, boostRemaining } from '../calc.js';
import { formatDollar } from '../format.js';

function clock(seconds) {
  const total = Math.ceil(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h} h ${String(m).padStart(2, '0')} min ${String(s).padStart(2, '0')} s`;
}

export function boostsHtml() {
  const rows = BOOST_TYPES.map((type) => `
    <div class="boost-row" data-boost="${type}">
      <div class="badges-info">
        <span class="title">Boost x${type}</span>
        <span class="muted small boost-left"></span>
      </div>
      <div class="badges-controls">
        <button type="button" class="tile-btn" data-delta="-1" aria-label="Quitar una hora de boost x${type}">−</button>
        <button type="button" class="tile-btn" data-delta="1" aria-label="Añadir una hora de boost x${type}">+</button>
      </div>
    </div>`).join('');
  return `
    <section class="boosts" aria-label="Boosts">
      ${rows}
      <span class="muted small" id="boost-note"></span>
    </section>`;
}

// Se llama cada segundo: cuenta atrás, botones bloqueados y ritmo actual con boost.
export function refreshBoosts(root, account, dailyNow) {
  const left = boostRemaining(account, new Date());
  const active = left > 0 ? account.boost_type : 0;

  for (const row of root.querySelectorAll('.boost-row')) {
    const type = Number(row.dataset.boost);
    const mine = active === type;
    row.querySelector('.boost-left').textContent = mine ? `Quedan ${clock(left)}` : 'Sin boost';
    row.querySelector('[data-delta="-1"]').disabled = !mine;
    row.querySelector('[data-delta="1"]').disabled = (active !== 0 && !mine) || (mine && left + BOOST_STEP_SECONDS > BOOST_MAX_SECONDS);
  }

  root.querySelector('#boost-note').textContent = active
    ? `Solo puede haber un boost activo. Ahora ganas ${formatDollar(dailyNow * active, 4)} al día.`
    : 'Solo puede haber un boost activo a la vez.';
}

// onChange recibe (multiplicador del boost, +1 o −1).
export function wireBoosts(root, onChange) {
  root.querySelectorAll('.boost-row .tile-btn').forEach((button) => {
    button.addEventListener('click', () => {
      onChange(Number(button.closest('.boost-row').dataset.boost), Number(button.dataset.delta));
    });
  });
}
