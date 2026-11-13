// Fecha estimada en la que se llega a la retirada mínima, al ritmo actual (sin boost).
const DAY_MS = 86400000;

export function etaDate(days, now = new Date()) {
  if (days === null || !Number.isFinite(days)) return null;
  const date = new Date(now.getTime() + days * DAY_MS);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '');
}
