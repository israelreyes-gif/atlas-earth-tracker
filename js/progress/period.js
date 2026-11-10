// Periodos de la pantalla Progresión: rango de fechas, marcas del eje y escala inicial en $.
import { formatShortMonth } from '../format.js';

export const PERIODS = [
  { key: 'hoy', label: 'Hoy', scale: 0.1, endName: 'Al terminar hoy' },
  { key: 'mes', label: 'Mes', scale: 1, endName: 'A final de mes' },
  { key: 'tres', label: '3 meses', scale: 2, endName: 'Al terminar los 3 meses' },
  { key: 'ano', label: 'Año', scale: 10, endName: 'A final de año' },
];

// Devuelve { start, end, ticks: [{ t, label, anchor }] } con fechas en milisegundos (hora local).
export function rangeOf(key, now) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  if (key === 'hoy') {
    const start = new Date(y, m, d);
    const ticks = [0, 6, 12, 18, 24].map((h) => ({ t: new Date(y, m, d, h).getTime(), label: `${h} h` }));
    return { start: start.getTime(), end: new Date(y, m, d + 1).getTime(), ticks };
  }

  if (key === 'mes') {
    const last = new Date(y, m + 1, 0).getDate();
    const ticks = [1, 10, 20].map((day) => ({ t: new Date(y, m, day).getTime(), label: String(day) }));
    ticks.push({ t: new Date(y, m + 1, 1).getTime(), label: String(last), anchor: 'end' });
    return { start: new Date(y, m, 1).getTime(), end: new Date(y, m + 1, 1).getTime(), ticks };
  }

  if (key === 'tres') {
    const ticks = [0, 1, 2].map((i) => {
      const date = new Date(y, m - 2 + i, 1);
      return { t: date.getTime(), label: formatShortMonth(date) };
    });
    ticks.push({ t: new Date(y, m + 1, 1).getTime(), label: 'fin', anchor: 'end' });
    return { start: new Date(y, m - 2, 1).getTime(), end: new Date(y, m + 1, 1).getTime(), ticks };
  }

  const ticks = [0, 3, 6, 9].map((i) => {
    const date = new Date(y, i, 1);
    return { t: date.getTime(), label: formatShortMonth(date) };
  });
  ticks.push({ t: new Date(y + 1, 0, 1).getTime(), label: 'fin', anchor: 'end' });
  return { start: new Date(y, 0, 1).getTime(), end: new Date(y + 1, 0, 1).getTime(), ticks };
}

// Escala del eje: la del periodo, duplicada tantas veces como haga falta para que quepa el valor.
export function scaleFor(base, maxValue) {
  let scale = base;
  while (maxValue > scale) scale *= 2;
  return scale;
}
