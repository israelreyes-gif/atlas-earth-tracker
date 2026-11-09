// Cálculos puros (sin DOM ni red). Todos los importes en dólares ($).
export const DAY_MS = 86400000;
export const MONTH_DAYS = 30.44;

export function latestSnapshot(snapshots) {
  return snapshots.length ? snapshots[snapshots.length - 1] : null;
}

export function incomePerParcel(snapshot) {
  return snapshot && snapshot.parcels > 0 ? snapshot.daily_income / snapshot.parcels : 0;
}

// Fracción del día transcurrida desde las 00:00 (0 a 1).
export function dayFractionElapsed(now) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return Math.min(1, Math.max(0, (now - start) / DAY_MS));
}

export function earnedToday(snapshot, now) {
  return snapshot.daily_income * dayFractionElapsed(now);
}

// Saldo del último registro más lo ganado desde entonces.
export function estimatedBalance(snapshot, now) {
  const elapsedDays = Math.max(0, (now - new Date(snapshot.taken_at)) / DAY_MS);
  return snapshot.balance + elapsedDays * snapshot.daily_income;
}

// Días hasta llegar a "target" ganando "dailyGain" al día.
export function daysToReach(current, target, dailyGain) {
  if (current >= target) return 0;
  if (dailyGain <= 0) return Infinity;
  return (target - current) / dailyGain;
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function addMonths(date, months) {
  return addDays(date, months * MONTH_DAYS);
}

export function monthsToParcels(current, target, pace) {
  if (current >= target) return 0;
  if (pace <= 0) return Infinity;
  return (target - current) / pace;
}

// Parcelas que faltan para llegar a una ganancia diaria objetivo.
export function parcelsForIncome(dailyIncome, perParcel, target) {
  if (dailyIncome >= target) return 0;
  if (perParcel <= 0) return Infinity;
  return Math.ceil((target - dailyIncome) / perParcel);
}

export function filterByMonths(snapshots, months, now) {
  const since = now.getTime() - months * MONTH_DAYS * DAY_MS;
  return snapshots.filter((snapshot) => new Date(snapshot.taken_at).getTime() >= since);
}

// Parcelas compradas al mes, según el primer y último registro de la lista.
export function purchasePace(snapshots) {
  if (snapshots.length < 2) return 0;
  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const months = (new Date(last.taken_at) - new Date(first.taken_at)) / (DAY_MS * MONTH_DAYS);
  if (months < 0.25) return 0;
  return Math.max(0, (last.parcels - first.parcels) / months);
}

// Compara comprar ahora (el coste sale del saldo) con esperar a canjear.
export function analyzePurchase({ cost, parcels, perParcel, balance, dailyIncome, threshold }) {
  const extraDaily = parcels * perParcel;
  const newDaily = dailyIncome + extraDaily;
  const paybackDays = extraDaily > 0 ? cost / extraDaily : Infinity;
  const waitDays = daysToReach(balance, threshold, dailyIncome);
  const buyDays = daysToReach(balance - cost, threshold, newDaily);
  return {
    extraDaily,
    newDaily,
    paybackDays,
    waitDays,
    buyDays,
    delayDays: buyDays - waitDays,
    netYear: extraDaily * 365 - cost,
  };
}
