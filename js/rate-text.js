// 0.0000000011 -> "0,0000000011" (sin notación científica, con coma como en el resto de la app)
export function rateToText(rate) {
  return rate.toFixed(12).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
}
