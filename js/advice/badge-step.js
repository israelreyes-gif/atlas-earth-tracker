// Siguiente escalón del pasaporte: cuántas insignias faltan y cuánto sube el aumento.
import { bonusFor } from '../calc.js';

// Devuelve null si ya se está en el último escalón.
export function nextBadgeStep(badges, levels, badgeCostAB) {
  const bonusNow = bonusFor(badges, levels);
  const next = [...levels]
    .sort((a, b) => a.min_badges - b.min_badges)
    .find((level) => level.min_badges > badges && level.bonus > bonusNow);
  if (!next) return null;
  const missing = next.min_badges - badges;
  return { missing, costAB: missing * badgeCostAB, bonusNow, bonusNext: next.bonus };
}
