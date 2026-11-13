// Consejos para el dinero: qué hacer con los $ y con los AB, con las cuentas a la vista.
import { dailyIncome } from '../calc.js';
import { RULES } from '../rules.js';
import { nextBadgeStep } from './badge-step.js';
import { expectedParcelDaily } from './parcel-yield.js';

// types, levels, badges: estado actual. balance: saldo disponible ahora ($). multiplier: 1 + aumento de insignias.
export function buildAdvice({ types, levels, badges, balance, multiplier }) {
  const baseDaily = dailyIncome(types, 1);
  const daily = dailyIncome(types, multiplier);
  const parcelDaily = expectedParcelDaily(types, RULES.rarityProbability);
  const parcelDailyNow = parcelDaily * multiplier;

  // Retirada: cuánto falta para el mínimo y cuánto se tarda al ritmo actual (sin boost).
  const missing = Math.max(0, RULES.minimumWithdrawal - balance);
  const withdraw = { canWithdraw: missing === 0, missing, days: missing > 0 && daily > 0 ? missing / daily : null };

  // AB gratis: parcelas hasta que el siguiente escalón de insignias rinda más que esas mismas parcelas.
  const step = nextBadgeStep(badges, levels, RULES.badgeCostAB);
  let target;
  if (!step) {
    target = { kind: 'max' };
  } else {
    const gain = step.bonusNext - step.bonusNow;
    const breakEven = ((step.costAB / RULES.parcelCostAB) * parcelDaily * (1 + step.bonusNow)) / gain;
    target = { kind: baseDaily >= breakEven ? 'badges' : 'parcels', step, baseDaily, breakEven };
  }

  // Canjear 1 $ por AB: cuánto tardaría en devolverte el dólar con lo que rinde la fracción de parcela que compra.
  const parcelFraction = RULES.exchangeRate / RULES.parcelCostAB;
  const gainPerDollar = parcelFraction * parcelDailyNow;
  const paybackDays = gainPerDollar > 0 ? 1 / gainPerDollar : null;
  const convert = { paybackDays, worth: paybackDays !== null && paybackDays <= RULES.paybackHorizonDays };

  return { withdraw, target, convert };
}
