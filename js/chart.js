// Gráfica de línea en SVG. Sin librerías.
import { formatDay, formatNumber, formatShortMonth } from './format.js';

const WIDTH = 342;
const HEIGHT = 210;
const LEFT = 34;
const RIGHT = 334;
const TOP = 16;
const BOTTOM = 170;

function niceMax(value) {
  if (value <= 0) return 1;
  const exponent = Math.pow(10, Math.floor(Math.log10(value)));
  const fraction = value / exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * exponent;
}

// points: [{ t: milisegundos, v: valor }] ordenados por t.
export function lineChart(points, ariaLabel) {
  if (points.length === 0) return '<p class="muted">Aún no hay registros en este periodo.</p>';

  const max = niceMax(Math.max(...points.map((p) => p.v)) * 1.1);
  const tMin = points[0].t;
  const tMax = points[points.length - 1].t;
  const x = (t) => (tMin === tMax ? (LEFT + RIGHT) / 2 : LEFT + ((t - tMin) / (tMax - tMin)) * (RIGHT - LEFT));
  const y = (v) => BOTTOM - (v / max) * (BOTTOM - TOP);
  const decimals = max < 10 ? 1 : 0;

  const line = points.map((p) => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${x(tMin).toFixed(1)},${BOTTOM} ${line} ${x(tMax).toFixed(1)},${BOTTOM}`;
  const last = points[points.length - 1];

  const grid = [0, max / 2, max]
    .map((v) => `
      <line x1="${LEFT}" y1="${y(v)}" x2="${RIGHT}" y2="${y(v)}" stroke="${v === 0 ? '#C9D4CD' : '#E3EAE5'}" stroke-width="1"/>
      <text x="0" y="${y(v) + 4}" font-size="11" fill="#55655C" font-family="Inter, sans-serif">${formatNumber(v, decimals)}</text>`)
    .join('');

  const longSpan = tMax - tMin > 90 * 86400000;
  const labels = [0, 1, 2, 3, 4]
    .map((i) => {
      const t = tMin + ((tMax - tMin) * i) / 4;
      const text = longSpan ? formatShortMonth(new Date(t)) : formatDay(new Date(t));
      return `<text x="${x(t).toFixed(1)}" y="192" font-size="11" fill="#55655C" font-family="Inter, sans-serif" text-anchor="middle">${text}</text>`;
    })
    .join('');

  return `
    <svg class="chart" role="img" aria-label="${ariaLabel}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      ${grid}
      <polygon points="${area}" fill="#DCEBE1"/>
      <polyline points="${line}" fill="none" stroke="#1B6E45" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${x(last.t).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="5" fill="#1B6E45" stroke="#FFFFFF" stroke-width="2"/>
      ${labels}
    </svg>`;
}
