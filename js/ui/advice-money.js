// Tarjeta DINERO: aro de progreso hacia la retirada mínima y "GUÁRDALO", "RETIRA" o, si compensa, "CANJEA".
import { formatDollar, formatNumber } from '../format.js';
import { RULES } from '../rules.js';
import { etaDate } from '../advice/eta-date.js';

const CIRCUMFERENCE = 201; // 2 * PI * radio 32

function duration(days) {
  if (days >= 730) return `${formatNumber(days / 365, 0)} años`;
  if (days >= 60) return `${formatNumber(days / 30.44, 0)} meses`;
  return `${formatNumber(days, 0)} días`;
}

function view(withdraw, convert, balance) {
  if (convert.worth) return { cls: 'swap', figure: formatDollar(balance), sub: `recuperas 1 $ en ${duration(convert.paybackDays)}`, chip: 'CANJEA' };
  if (withdraw.canWithdraw) return { cls: 'go', figure: formatDollar(balance), sub: 'listo para retirar', chip: 'RETIRA' };
  const eta = etaDate(withdraw.days);
  const sub = eta ? `faltan para retirar<br><b>llegas el ${eta}</b>` : 'faltan para retirar';
  return { cls: 'keep', figure: formatDollar(withdraw.missing), sub, chip: 'GUÁRDALO' };
}

export function moneyCardHtml(withdraw, convert, balance) {
  const v = view(withdraw, convert, balance);
  const progress = Math.min(1, Math.max(0, balance / RULES.minimumWithdrawal));
  const offset = (CIRCUMFERENCE * (1 - progress)).toFixed(0);
  return `
    <div class="advice-card money ${v.cls}">
      <span class="advice-title">DINERO</span>
      <div class="advice-ring">
        <svg width="78" height="78" viewBox="0 0 78 78" aria-hidden="true">
          <circle class="ring-track" cx="39" cy="39" r="32"/>
          <circle class="ring-fill" cx="39" cy="39" r="32" stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${offset}" transform="rotate(-90 39 39)"/>
        </svg>
        <span>${v.figure}</span>
      </div>
      <span class="advice-sub">${v.sub}</span>
      <span class="advice-chip">${v.chip}</span>
    </div>`;
}
