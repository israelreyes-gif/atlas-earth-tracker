// Cálculos puros (sin DOM ni red). Importes en dólares ($).
export const SECONDS_PER_DAY = 86400;
export const DAYS_PER_MONTH = 30.44;

// Lo que ganan todas las parcelas por segundo.
export function incomePerSecond(types) {
  return types.reduce((sum, type) => sum + type.count * type.rate, 0);
}

export function dailyIncome(types) {
  return incomePerSecond(types) * SECONDS_PER_DAY;
}

export function monthlyIncome(types) {
  return dailyIncome(types) * DAYS_PER_MONTH;
}

export function totalParcels(types) {
  return types.reduce((sum, type) => sum + type.count, 0);
}

// Cifras de dinero en este instante: lo último apuntado + lo ganado desde entonces.
export function estimate(account, types, now) {
  const seconds = Math.max(0, (now - new Date(account.updated_at)) / 1000);
  const earned = incomePerSecond(types) * seconds;
  return {
    total: account.total_earned + earned,
    balance: account.balance + earned,
    spent: account.total_earned - account.balance,
  };
}
