// Boost de una ventana de tiempo, reconstruido del historial.
// Cada punto vale desde su fecha hasta la del siguiente (el último, hasta ahora). Si tenía boost, este dura
// "seconds" segundos desde el punto; mientras dura se gana (tipo − 1) veces más que el ritmo base.
const DAY_MS = 86400000;

// points: [{ t (ms), type, seconds, rate }] ordenados. Devuelve horas de boost, $ extra y días cubiertos.
export function boostStats(points, nowMs, winStart, winEnd) {
  let boostedMs = 0;
  let extra = 0;
  let coveredMs = 0;

  points.forEach((point, index) => {
    const start = point.t;
    const end = index + 1 < points.length ? points[index + 1].t : nowMs;
    coveredMs += Math.max(0, Math.min(end, winEnd) - Math.max(start, winStart));
    if (!point.type || point.seconds <= 0) return;
    const boostEnd = start + Math.min(end - start, point.seconds * 1000);
    const overlap = Math.max(0, Math.min(boostEnd, winEnd) - Math.max(start, winStart));
    boostedMs += overlap;
    extra += point.rate * (overlap / 1000) * (point.type - 1);
  });

  const days = coveredMs / DAY_MS;
  return {
    days,
    boostedHours: boostedMs / 3600000,
    extra,
    extraPerDay: days > 0 ? extra / days : 0,
    hoursPerDay: days > 0 ? boostedMs / 3600000 / days : 0,
  };
}
