// Reglas del juego usadas por los consejos. Si Atlas Earth las cambia, se actualizan aquí y solo aquí.
export const RULES = {
  parcelCostAB: 100, // AB que cuesta canjear una parcela (el tipo sale al azar)
  badgeCostAB: 200, // AB que cuesta una insignia
  exchangeRate: 25, // AB que se reciben por cada dólar canjeado
  minimumWithdrawal: 5, // $ mínimos para retirar
  // Probabilidad de que la parcela canjeada sea de cada tipo (pantalla "Detalles de rareza" del juego).
  rarityProbability: { comun: 0.5, raro: 0.3, epico: 0.15, legendario: 0.05 },
  // Si recuperar lo invertido tarda más que esto, canjear dólares por AB no se recomienda.
  paybackHorizonDays: 365,
};
