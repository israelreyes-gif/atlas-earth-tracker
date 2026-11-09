// Compras: ¿compensa comprar parcelas ahora o esperar a retirar?
import { addDays, analyzePurchase, estimatedBalance, incomePerParcel, latestSnapshot } from '../calc.js';
import { formatDay, formatDays, formatEuro, formatNumber, parseNumber } from '../format.js';
import { state } from '../store.js';
import { emptyHtml } from './empty.js';

function whenText(days, now) {
  if (days === 0) return 'Ya';
  if (!Number.isFinite(days)) return '—';
  return formatDay(addDays(now, days));
}

function columnsHtml(result, now) {
  return `
    <div class="compare">
      <div class="card highlight">
        <span class="name">Comprar ahora</span>
        <div class="item"><span class="label">Se amortiza en</span><span class="value">${Number.isFinite(result.paybackDays) ? formatDays(result.paybackDays) : '—'}</span></div>
        <div class="item"><span class="label">Retiras el</span><span class="value">${whenText(result.buyDays, now)}</span></div>
        <div class="item"><span class="label">Ingreso diario</span><span class="value">${formatEuro(result.newDaily)}</span></div>
      </div>
      <div class="card">
        <span class="name">Esperar y retirar</span>
        <div class="item"><span class="label">Se amortiza en</span><span class="value">—</span></div>
        <div class="item"><span class="label">Retiras el</span><span class="value">${whenText(result.waitDays, now)}</span></div>
        <div class="item"><span class="label">Ingreso diario</span><span class="value">${formatEuro(result.newDaily - result.extraDaily)}</span></div>
      </div>
    </div>`;
}

function verdictHtml(result, cost, balance) {
  const worth = result.paybackDays <= 365;
  const delay = Math.round(result.delayDays);
  const delayText = delay <= 0 ? 'no retrasa tu retiro' : `retrasa tu retiro ${formatDays(delay)}`;
  const body = worth
    ? `Se paga sola en ${formatDays(result.paybackDays)}, deja ${result.netYear >= 0 ? '+' : ''}${formatEuro(result.netYear)} netos tras un año y ${delayText}.`
    : `Tardaría ${formatDays(result.paybackDays)} en pagarse, más de un año, y ${delayText}.`;
  const funds = cost > balance
    ? `<p>Ahora mismo tu saldo estimado (${formatEuro(balance)}) no cubre esta compra.</p>`
    : '';
  return `
    <section class="verdict">
      <span class="title">${worth ? 'Te compensa comprar' : 'Mejor espera'}</span>
      <p>${body}</p>
      ${funds}
    </section>
    <p class="muted small">Estimación con tu ganancia actual por parcela; el coste sale de tu saldo.</p>`;
}

export function renderPurchases(container) {
  const snapshot = latestSnapshot(state.snapshots);
  if (!snapshot) {
    container.innerHTML = emptyHtml('¿Compensa comprar?');
    return;
  }

  container.innerHTML = `
    <div>
      <h1>¿Compensa comprar?</h1>
      <span class="muted">Compara comprar ahora con esperar a retirar</span>
    </div>
    <form class="card" id="purchase-form" novalidate>
      <div class="grid2">
        <div class="field">
          <label for="cost">Coste de la compra (€)</label>
          <input id="cost" inputmode="decimal">
        </div>
        <div class="field">
          <label for="parcels">Parcelas que compras</label>
          <input id="parcels" inputmode="numeric">
        </div>
      </div>
      <div class="row between baseline">
        <span class="muted">Ingreso extra</span>
        <span class="num" id="extra" style="color: var(--green)">—</span>
      </div>
    </form>
    <div id="result" style="display: flex; flex-direction: column; gap: 14px"></div>`;

  const costInput = container.querySelector('#cost');
  const parcelsInput = container.querySelector('#parcels');
  const extraEl = container.querySelector('#extra');
  const resultEl = container.querySelector('#result');

  function update() {
    const cost = parseNumber(costInput.value);
    const parcels = parseNumber(parcelsInput.value);
    if (!(cost >= 0) || !(parcels > 0)) {
      extraEl.textContent = '—';
      resultEl.innerHTML = '<p class="muted">Escribe el coste y las parcelas para compararlo.</p>';
      return;
    }

    const now = new Date();
    const balance = estimatedBalance(snapshot, now);
    const result = analyzePurchase({
      cost,
      parcels,
      perParcel: incomePerParcel(snapshot),
      balance,
      dailyIncome: snapshot.daily_income,
      threshold: state.settings.withdraw_threshold,
    });

    extraEl.textContent = `+${formatEuro(result.extraDaily, 3)} al día`;
    resultEl.innerHTML = columnsHtml(result, now) + verdictHtml(result, cost, balance);
  }

  costInput.addEventListener('input', update);
  parcelsInput.addEventListener('input', update);
  update();
}
