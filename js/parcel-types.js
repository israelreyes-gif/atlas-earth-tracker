// Tipos de parcela. Cada tipo tiene un nombre y lo que da por SEGUNDO una parcela, tal como lo muestra el juego.
// Un registro guarda cuántas parcelas hay de cada tipo en "counts" ({ idTipo: cantidad }).
export const SECONDS_PER_DAY = 86400;

export function newTypeId() {
  return `t${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

// $ al día que da una parcela de ese tipo. "multiplier" = boosts y pasaporte (1 si no se aplica ninguno).
export function dailyPerParcel(type, multiplier) {
  return type.rate * SECONDS_PER_DAY * multiplier;
}

// Total de parcelas y ganancia diaria a partir de las cantidades por tipo.
export function totalsFromCounts(types, counts, multiplier) {
  let parcels = 0;
  let daily = 0;
  for (const type of types) {
    const amount = counts[type.id] ?? 0;
    parcels += amount;
    daily += amount * dailyPerParcel(type, multiplier);
  }
  return { parcels, daily };
}

export function countsOf(snapshot) {
  return snapshot && snapshot.counts ? snapshot.counts : {};
}

// 0.0000000011 -> "0,0000000011" (sin notación científica)
export function rateToText(rate) {
  if (rate === undefined) return '';
  return rate.toFixed(12).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
}
