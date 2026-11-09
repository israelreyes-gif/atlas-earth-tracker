// Cobrar: ingresos acumulados, canjear por dinero real (desde el mínimo) o pasarlos a Atlas Bucks para comprar parcelas.
import { addDays, analyzePurchase, daysToReach, estimatedBalance, incomePerParcel, latestSnapshot } from '../calc.js';
import { formatDay, formatDays, formatDollar, formatNumber, parseNumber } from '../format.js';
import { dailyPerParcel } from '../parcel-types.js';
import { escapeHtml } from '../html.js';
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
        <div class="item"><span class="label">Canjeas el</span><span class="value">${whenText(result.buyDays, now)}</span></div>
        <div class="item"><span class="label">Ganas al día</span><span class="value">${formatDollar(result.newDaily, 3)}</span></div>
      </div>
      <div class="card">
        <span class="name">Esperar y canjear</span>
        <div class="item"><span class="label">Se amortiza en</span><span class="value">—</span></div>
        <div class="item"><span class="label">Canjeas el</span><span class="value">${whenText(result.waitDays, now)}</span></div>
        <div class="item"><span class="label">Ganas al día</span><span class="value">${formatDollar(result.newDaily - result.extraDaily, 3)}</span></div>
      </div>
    </div>`;
}

function verdictHtml(result, balance, cost) {
  const worth = result.paybackDays <= 365;
  const delay = Math.round(result.delayDays);
  const delayText = delay <= 0 ? 'no retrasa tu canje' : `retrasa tu canje ${formatDays(delay)}`;
  const body = worth
    ? `Se paga sola en ${formatDays(result.paybackDays)}, deja ${result.netYear >= 0 ? '+' : ''}${formatDollar(result.netYear)} netos tras un año y ${delayText}.`
    : `Tardaría ${formatDays(result.paybackDays)} en pagarse, más de un año, y ${delayText}.`;
  const funds = cost > balance
    ? `<p><strong>Ahora mismo tus ingresos acumulados (${formatDollar(balance)}) no cubren esta compra.</strong></p>`
    : '';
  return `
    <section class="verdict">
      <span class="title">${worth ? 'Te compensa comprar' : 'Mejor espera'}</span>
      <p>${body}</p>
      ${funds}
    </section>
    <p class="muted small">Estimación con el tipo de parcela elegido o, si no eliges, con lo que ganas de media por parcela.</p>`;
}

export function renderPurchases(container) {
  const snapshot = latestSnapshot(state.snapshots);
  if (!snapshot) {
    container.innerHTML = emptyHtml('Cobrar');
    return;
  }

  const { withdraw_threshold: threshold, ab_per_dollar: abPerDollar, parcel_ab: parcelAb } = state.settings;
  const parcelCost = parcelAb / abPerDollar; // $ de renta que cuesta una parcela
  const thresholdText = formatDollar(threshold, Number.isInteger(threshold) ? 0 : 2);

  container.innerHTML = `
    <div>
      <h1>Cobrar</h1>
      <span class="muted">Canjea por dinero real o pásalo a Atlas Bucks</span>
    </div>

    <section class="hero" aria-labelledby="acc-title">
      <span class="soft" id="acc-title">Ingresos acumulados</span>
      <span class="big small-big" id="acc"></span>
      <div class="bar" role="progressbar" aria-label="Progreso hacia el canjeo" aria-valuemin="0" aria-valuemax="100" id="acc-progress"><i id="acc-bar"></i></div>
      <span class="soft" id="acc-eta"></span>
    </section>

    <section class="card" aria-labelledby="cash-title">
      <span class="title" id="cash-title">Canjear por dinero real</span>
      <p class="muted">Se puede canjear cuando tus ingresos acumulados llegan a ${thresholdText}.</p>
      <p class="status" id="cash-status"></p>
    </section>

    <section class="card" aria-labelledby="ab-title">
      <span class="title" id="ab-title">Pasar a Atlas Bucks y comprar parcelas</span>
      <p class="muted">1 $ = ${formatNumber(abPerDollar)} AB · una parcela = ${formatNumber(parcelAb)} AB (${formatDollar(parcelCost)})</p>
      ${state.parcelTypes.length ? `<div class="field">
        <label for="type">Tipo de parcela que compras</label>
        <select id="type">
          <option value="">Media de mis parcelas</option>
          ${state.parcelTypes.map((type) => `<option value="${escapeHtml(type.id)}">${escapeHtml(type.name)}</option>`).join('')}
        </select>
      </div>` : ''}
      <div class="field">
        <label for="parcels">Parcelas a comprar</label>
        <div class="stepper">
          <button type="button" class="step" id="minus" aria-label="Una parcela menos">−</button>
          <input id="parcels" inputmode="numeric" value="1" aria-describedby="cost-line">
          <button type="button" class="step" id="plus" aria-label="Una parcela más">+</button>
        </div>
      </div>
      <button type="button" class="link-btn" id="max"></button>
      <div class="row between baseline" id="cost-line">
        <span class="muted">Coste</span>
        <span class="num" id="cost"></span>
      </div>
      <div class="row between baseline">
        <span class="muted">Ingreso extra</span>
        <span class="num" id="extra" style="color: var(--green)">—</span>
      </div>
    </section>

    <div id="result" aria-live="polite" style="display: flex; flex-direction: column; gap: 14px"></div>`;

  const accEl = container.querySelector('#acc');
  const accBar = container.querySelector('#acc-bar');
  const accProgress = container.querySelector('#acc-progress');
  const accEta = container.querySelector('#acc-eta');
  const cashStatus = container.querySelector('#cash-status');
  const parcelsInput = container.querySelector('#parcels');
  const typeSelect = container.querySelector('#type');
  const maxButton = container.querySelector('#max');
  const costEl = container.querySelector('#cost');
  const extraEl = container.querySelector('#extra');
  const resultEl = container.querySelector('#result');

  // Lo que daría cada parcela nueva: la del tipo elegido o la media actual.
  function perParcelNow() {
    const type = typeSelect ? state.parcelTypes.find((item) => item.id === typeSelect.value) : null;
    return type ? dailyPerParcel(type, state.settings.income_multiplier) : incomePerParcel(snapshot);
  }

  const maxParcels = (balance) => Math.max(0, Math.floor(balance / parcelCost));

  // Se actualiza cada segundo: ingresos acumulados, progreso y estado del canjeo.
  function tick() {
    const now = new Date();
    const balance = estimatedBalance(snapshot, now);
    const share = Math.min(1, balance / threshold);
    accEl.textContent = formatDollar(balance, 6);
    accBar.style.width = `${share * 100}%`;
    accProgress.setAttribute('aria-valuenow', String(Math.round(share * 100)));

    const days = daysToReach(balance, threshold, snapshot.daily_income);
    if (days === 0) {
      accEta.textContent = `Superas el mínimo de ${thresholdText}`;
      cashStatus.textContent = '¡Ya puedes canjear!';
      cashStatus.className = 'status ok';
    } else {
      accEta.textContent = `Te faltan ${formatDollar(threshold - balance)}`;
      cashStatus.textContent = Number.isFinite(days)
        ? `Llegas el ${formatDay(addDays(now, days))} (en ${formatDays(days)})`
        : 'Sin ganancias no se llega al mínimo';
      cashStatus.className = 'status';
    }
    maxButton.textContent = `Todas las que me llegan: ${formatNumber(maxParcels(balance))}`;
  }

  // Se actualiza al cambiar el número de parcelas.
  function update() {
    const parcels = parseNumber(parcelsInput.value);
    if (!Number.isInteger(parcels) || parcels < 1) {
      costEl.textContent = '—';
      extraEl.textContent = '—';
      resultEl.innerHTML = '<p class="muted">Escribe cuántas parcelas quieres comprar (1 o más).</p>';
      return;
    }

    const now = new Date();
    const balance = estimatedBalance(snapshot, now);
    const cost = parcels * parcelCost;
    const result = analyzePurchase({
      cost,
      parcels,
      perParcel: perParcelNow(),
      balance,
      dailyIncome: snapshot.daily_income,
      threshold,
    });

    costEl.textContent = `${formatDollar(cost)} · ${formatNumber(parcels * parcelAb)} AB`;
    extraEl.textContent = `+${formatDollar(result.extraDaily, 4)} al día`;
    resultEl.innerHTML = columnsHtml(result, now) + verdictHtml(result, balance, cost);
  }

  function setParcels(value) {
    parcelsInput.value = String(Math.max(1, value));
    update();
  }

  container.querySelector('#minus').addEventListener('click', () => {
    const current = parseNumber(parcelsInput.value);
    setParcels(Number.isInteger(current) ? current - 1 : 1);
  });
  container.querySelector('#plus').addEventListener('click', () => {
    const current = parseNumber(parcelsInput.value);
    setParcels(Number.isInteger(current) ? current + 1 : 1);
  });
  maxButton.addEventListener('click', () => {
    setParcels(maxParcels(estimatedBalance(snapshot, new Date())));
  });
  parcelsInput.addEventListener('input', update);
  if (typeSelect) typeSelect.addEventListener('change', update);

  tick();
  update();
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}
