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

// Cifras de dinero en este instante: lo último apuntado + lo ganado desde entonces.
export function estimate(account, types, multiplier, now) {
  const seconds = Math.max(0, (now - new Date(account.updated_at)) / 1000);
  const earned = incomePerSecond(types, multiplier) * seconds;
  return {
    total: account.total_earned + earned,
    balance: account.balance + earned,
    spent: account.total_earned - account.balance,
  };
}
