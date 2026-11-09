// Tipos de parcela: cada tipo tiene un nombre y lo que da al día cada parcela (€).
// Un registro guarda cuántas parcelas hay de cada tipo en "counts" ({ idTipo: cantidad }).

export function newTypeId() {
  return `t${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

// Total de parcelas y ganancia diaria a partir de las cantidades por tipo.
export function totalsFromCounts(types, counts) {
  let parcels = 0;
  let daily = 0;
  for (const type of types) {
    const amount = counts[type.id] ?? 0;
    parcels += amount;
    daily += amount * type.income;
  }
  return { parcels, daily: Math.round(daily * 1e6) / 1e6 };
}

export function countsOf(snapshot) {
  return snapshot && snapshot.counts ? snapshot.counts : {};
}
