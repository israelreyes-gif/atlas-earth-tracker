// Convierte un objetivo en lo que se muestra: título, fecha estimada, progreso y detalle.
import { addDays, daysToReach, MONTH_DAYS, monthsToParcels, parcelsForIncome } from './calc.js';
import { formatDay, formatEuro, formatMonthYear, formatNumber } from './format.js';

export function euroTarget(value) {
  return formatEuro(value, Number.isInteger(value) ? 0 : 2);
}

function dateLabel(days, now) {
  if (days === 0) return '¡Conseguido!';
  if (!Number.isFinite(days)) return 'Sin ritmo';
  const date = addDays(now, days);
  return days <= 60 ? formatDay(date) : formatMonthYear(date);
}

const NO_PACE = 'Sube el ritmo de compra para ver la fecha';

function moneyInfo(goal, { snapshot, balance, now }) {
  const days = daysToReach(balance, goal.target, snapshot.daily_income);
  return {
    title: goal.title ?? `Juntar ${euroTarget(goal.target)}`,
    when: dateLabel(days, now),
    progress: Math.min(1, balance / goal.target),
    detail: `${formatEuro(balance)} de ${euroTarget(goal.target)} · faltan ${formatEuro(Math.max(0, goal.target - balance))}`,
  };
}

function parcelsInfo(goal, { snapshot, pace, now }) {
  const months = monthsToParcels(snapshot.parcels, goal.target, pace);
  const missing = Math.max(0, goal.target - snapshot.parcels);
  return {
    title: `Llegar a ${formatNumber(goal.target)} parcelas`,
    when: dateLabel(months * MONTH_DAYS, now),
    progress: Math.min(1, snapshot.parcels / goal.target),
    detail: Number.isFinite(months)
      ? `${formatNumber(snapshot.parcels)} de ${formatNumber(goal.target)} · faltan ${formatNumber(missing)}`
      : NO_PACE,
  };
}

function incomeInfo(goal, { snapshot, perParcel, pace, now }) {
  const needed = parcelsForIncome(snapshot.daily_income, perParcel, goal.target);
  const months = monthsToParcels(0, needed, pace);
  return {
    title: `Ganar ${euroTarget(goal.target)} al día`,
    when: dateLabel(months * MONTH_DAYS, now),
    progress: Math.min(1, snapshot.daily_income / goal.target),
    detail: Number.isFinite(months)
      ? `${formatEuro(snapshot.daily_income)} de ${euroTarget(goal.target)} · faltan unas ${formatNumber(needed)} parcelas`
      : NO_PACE,
  };
}

export function buildGoalInfo(goal, context) {
  if (goal.type === 'parcels') return parcelsInfo(goal, context);
  if (goal.type === 'income') return incomeInfo(goal, context);
  return moneyInfo(goal, context);
}
