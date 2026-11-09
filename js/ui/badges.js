// Tarjeta de insignias del pasaporte: número con − y +, nivel y aumento que suma a la ganancia.
import { bonusFor } from '../calc.js';
import { formatNumber } from '../format.js';

const MAX_BADGES = 9999;

function levelOf(badges, levels) {
  return levels.find((item) => badges >= item.min_badges && badges <= item.max_badges);
}

export function badgesHtml() {
  return `
    <section class="badges" aria-label="Insignias del pasaporte">
      <div class="badges-info">
        <span class="title">Insignias</span>
        <span class="muted small" id="badges-level"></span>
      </div>
      <div class="badges-controls">
        <button type="button" class="tile-btn" id="badges-minus" aria-label="Quitar una insignia">−</button>
        <span class="badges-count num" id="badges-count"></span>
        <button type="button" class="tile-btn" id="badges-plus" aria-label="Añadir una insignia">+</button>
      </div>
    </section>`;
}

export function refreshBadges(root, badges, levels) {
  const level = levelOf(badges, levels);
  const bonus = Math.round(bonusFor(badges, levels) * 100);
  root.querySelector('#badges-count').textContent = formatNumber(badges);
  root.querySelector('#badges-level').textContent = level
    ? `Nivel ${level.level} · +${formatNumber(bonus)} % de aumento`
    : 'Sin nivel';
}

// onChange recibe +1 o −1 (entre 0 y 9999).
export function wireBadges(root, getBadges, onChange) {
  root.querySelector('#badges-minus').addEventListener('click', () => {
    if (getBadges() > 0) onChange(-1);
  });
  root.querySelector('#badges-plus').addEventListener('click', () => {
    if (getBadges() < MAX_BADGES) onChange(1);
  });
}
