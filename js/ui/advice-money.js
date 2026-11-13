// Tarjeta DINERO: aro de progreso hacia la retirada mínima y "GUÁRDALO" o "RETIRA".
import { formatDollar } from '../format.js';
import { RULES } from '../rules.js';

const CIRCUMFERENCE = 201; // 2 * PI * radio 32

export function moneyCardHtml(withdraw, balance) {
  const ready = withdraw.canWithdraw;
  const progress = Math.min(1, Math.max(0, balance / RULES.minimumWithdrawal));
  const offset = (CIRCUMFERENCE * (1 - progress)).toFixed(0);
  const figure = ready ? formatDollar(balance) : formatDollar(withdraw.missing);
  return `
    <div class="advice-card money ${ready ? 'go' : 'keep'}">
      <span class="advice-title">DINERO</span>
      <div class="advice-ring">
        <svg width="78" height="78" viewBox="0 0 78 78" aria-hidden="true">
          <circle class="ring-track" cx="39" cy="39" r="32"/>
          <circle class="ring-fill" cx="39" cy="39" r="32" stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${offset}" transform="rotate(-90 39 39)"/>
        </svg>
        <span>${figure}</span>
      </div>
      <span class="advice-sub">${ready ? 'listo para retirar' : 'faltan para retirar'}</span>
      <span class="advice-chip">${ready ? 'RETIRA' : 'GUÁRDALO'}</span>
    </div>`;
}
