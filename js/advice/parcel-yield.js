// Lo que rinde de media, al día y sin insignias ni boost, una parcela canjeada al azar.
import { SECONDS_PER_DAY } from '../calc.js';

export function expectedParcelDaily(types, probability) {
  return types.reduce((sum, type) => sum + (probability[type.id] ?? 0) * type.rate, 0) * SECONDS_PER_DAY;
}
