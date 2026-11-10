// Series de la pantalla Progresión: lo real (del historial), lo esperado y los totales.
// Todo se mide en "$ ganados desde el inicio del periodo" (o desde el primer punto del historial si es posterior).
import { dailyIncome, estimate } from '../calc.js';
import { boostStats } from './boost-stats.js';
import { PERIODS, rangeOf, scaleFor } from './period.js';

const DAY_MS = 86400000;
const REFERENCE_DAYS = 30;

export function buildProgress({ points, account, types, multiplier, now, key }) {
  if (points.length === 0) return null;

  const nowMs = now.getTime();
  const pts = points.map((p) => ({ t: Date.parse(p.at), total: p.total_earned, type: p.boost_type, seconds: p.boost_seconds, rate: p.rate }));
  const nowTotal = estimate(account, types, multiplier, now).total;

  const range = rangeOf(key, now);
  const startEff = Math.max(range.start, pts[0].t);

  // Fin de cada tramo: el siguiente punto o ahora.
  const endOf = (index) => (index + 1 < pts.length ? pts[index + 1].t : nowMs);

  // Total en un instante, con el mismo modelo que la app: base + lo ganado con el ritmo, x(tipo) mientras dura el boost.
  function totalAt(t) {
    if (t <= pts[0].t) return pts[0].total;
    let index = pts.length - 1;
    while (index > 0 && pts[index].t > t) index -= 1;
    const point = pts[index];
    const seconds = (Math.min(t, Math.max(endOf(index), point.t)) - point.t) / 1000;
    const boosted = point.type ? Math.min(seconds, point.seconds) : 0;
    return point.total + point.rate * (seconds + boosted * ((point.type || 1) - 1));
  }

  const startTotal = totalAt(startEff);
  // Vértices de la línea real: cada punto del historial y el momento en que acaba cada boost (ahí cambia la pendiente).
  const vertices = [];
  pts.forEach((point, index) => {
    if (point.t > startEff && point.t <= nowMs) vertices.push({ t: point.t, g: point.total - startTotal });
    const boostEnd = point.t + point.seconds * 1000;
    if (point.type && boostEnd > startEff && boostEnd < Math.min(endOf(index), nowMs)) {
      vertices.push({ t: boostEnd, g: totalAt(boostEnd) - startTotal });
    }
  });
  vertices.sort((one, other) => one.t - other.t);
  const realPoints = [{ t: startEff, g: 0 }, ...vertices];
  if (realPoints[realPoints.length - 1].t < nowMs) realPoints.push({ t: nowMs, g: nowTotal - startTotal });

  // Boost "de referencia": los 30 días anteriores al inicio; si no hay datos de antes, lo que haya.
  let reference = boostStats(pts, nowMs, startEff - REFERENCE_DAYS * DAY_MS, startEff);
  if (reference.days < 1) reference = boostStats(pts, nowMs, pts[0].t, nowMs);

  const baseDaily = dailyIncome(types, multiplier);
  const expectedDaily = baseDaily + reference.extraPerDay;
  const period = boostStats(pts, nowMs, startEff, nowMs);
  const realDaily = baseDaily + period.extraPerDay;

  const expectedAt = (t) => (expectedDaily * (t - startEff)) / DAY_MS;
  const gainedNow = nowTotal - startTotal;
  const expectedNow = expectedAt(nowMs);
  const endExpected = expectedAt(range.end);
  const endReal = gainedNow + (realDaily * (range.end - nowMs)) / DAY_MS;
  const base = PERIODS.find((item) => item.key === key).scale;

  return {
    range,
    startEff,
    nowMs,
    realPoints,
    expectedAt,
    realDaily,
    gainedNow,
    expectedNow,
    deviation: gainedNow - expectedNow,
    deviationPct: expectedNow > 0 ? ((gainedNow - expectedNow) / expectedNow) * 100 : 0,
    hoursDone: period.boostedHours,
    hoursExpected: (reference.hoursPerDay * (nowMs - startEff)) / DAY_MS,
    endExpected,
    endReal,
    referenceDays: reference.days,
    scale: scaleFor(base, Math.max(endExpected, endReal, gainedNow)),
  };
}
