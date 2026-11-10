// Cálculos puros (sin DOM ni red). Importes en dólares ($).
export const SECONDS_PER_DAY = 86400;
export const DAYS_PER_MONTH = 30.44;

// Aumento del pasaporte (0,05 = 5 %) según el número de insignias y la tabla de niveles.
export function bonusFor(badges, levels) {
  const level = levels.find((item) => badges >= item.min_badges && badges <= item.max_badges);
  return level ? level.bonus : 0;
}

// Multiplicador de la ganancia: 1 + aumento de las insignias.
export function multiplierFor(account, levels) {
  return 1 + bonusFor(account.badges, levels);
}

// Lo que ganan todas las parcelas por segundo.
export function incomePerSecond(types, multiplier = 1) {
  return types.reduce((sum, type) => sum + type.count * type.rate, 0) * multiplier;
}

export function dailyIncome(types, multiplier = 1) {
  return incomePerSecond(types, multiplier) * SECONDS_PER_DAY;
}

export function monthlyIncome(types, multiplier = 1) {
  return dailyIncome(types, multiplier) * DAYS_PER_MONTH;
}

export function totalParcels(types) {
  return types.reduce((sum, type) => sum + type.count, 0);
}

// Boost: account.boost_type (0, 20 o 50 = multiplicador) y account.boost_seconds (segundos que quedan en updated_at).
export const BOOST_TYPES = [20, 50];
export const BOOST_STEP_SECONDS = 3600;
export const BOOST_MAX_SECONDS = 5 * 3600;

function secondsSince(account, now) {
  return Math.max(0, (now - new Date(account.updated_at)) / 1000);
}

// Segundos de boost que quedan en este instante.
export function boostRemaining(account, now) {
  if (!account.boost_type) return 0;
  return Math.max(0, account.boost_seconds - secondsSince(account, now));
}

// Cifras de dinero en este instante: solo el total sube con el tiempo; el saldo es total − gastado.
// Lo ganado desde lo último apuntado se suma al total.
// Mientras dura el boost se gana "boost_type" veces más; después, el ritmo normal.
export function estimate(account, types, multiplier, now) {
  const seconds = secondsSince(account, now);
  const boosted = account.boost_type ? Math.min(seconds, account.boost_seconds) : 0;
  const factor = account.boost_type ? account.boost_type - 1 : 0;
  const earned = incomePerSecond(types, multiplier) * (seconds + boosted * factor);
  return {
    total: account.total_earned + earned,
    spent: account.spent,
    balance: account.total_earned + earned - account.spent,
  };
}

// La cuenta fijada en "now": dinero al instante y boost con lo que queda desde ahí.
export function freezeAccount(account, types, multiplier, now) {
  const value = estimate(account, types, multiplier, now);
  const left = Math.ceil(boostRemaining(account, now));
  return {
    ...account,
    total_earned: value.total,
    boost_type: left > 0 ? account.boost_type : 0,
    boost_seconds: left,
    updated_at: now.toISOString(),
  };
}
