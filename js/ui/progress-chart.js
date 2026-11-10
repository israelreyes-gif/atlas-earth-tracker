// Gráfica de Progresión (SVG): lo esperado, lo real, el futuro a ritmo real y el sombreado entre ambos.
import { formatNumber } from '../format.js';

const GREEN = '#1B6E45';
const AMBER = '#B07A06';
const RED = '#C0392B';
const LEFT = 40;
const RIGHT = 10;
const TOP = 12;
const BOTTOM = 26;

const path = (points) => `M${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')}`;
const shade = (points, color) => `<path d="${path(points)} Z" fill="${color}" opacity=".55"/>`;

// Dibuja la gráfica con el tamaño (en píxeles) del hueco donde va, para que no se deforme.
export function chartSvg(s, W, H) {
  const { range, scale } = s;
  const x = (t) => LEFT + ((W - LEFT - RIGHT) * (t - range.start)) / (range.end - range.start);
  const y = (v) => TOP + (H - TOP - BOTTOM) * (1 - v / scale);
  const decimals = scale < 1 ? 2 : scale < 5 ? 1 : 0;
  const nowX = x(s.nowMs);
  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Progresión: real frente a esperado">`;

  svg += `<rect x="${nowX}" y="${TOP}" width="${x(range.end) - nowX}" height="${H - TOP - BOTTOM}" fill="#EAF0EC"/>`;
  for (let i = 0; i <= 5; i += 1) {
    const value = (scale * i) / 5;
    svg += `<line x1="${LEFT}" x2="${W - RIGHT}" y1="${y(value)}" y2="${y(value)}" stroke="#DDE5DF"/>`;
    svg += `<text x="${LEFT - 6}" y="${y(value) + 4}" font-size="11" fill="#55655C" text-anchor="end">${formatNumber(value, decimals)}</text>`;
  }
  for (const tick of range.ticks) {
    svg += `<text x="${x(tick.t)}" y="${H - 8}" font-size="11" fill="#55655C" text-anchor="${tick.anchor ?? 'middle'}">${tick.label}</text>`;
  }
  svg += `<line x1="${nowX}" x2="${nowX}" y1="${TOP}" y2="${H - BOTTOM}" stroke="#12201A" stroke-dasharray="3 3"/>`;

  // Sombreado entre lo esperado y lo real: verde si va por encima, rojo si va por debajo.
  const real = s.realPoints;
  for (let i = 0; i + 1 < real.length; i += 1) {
    const [a, b] = [real[i], real[i + 1]];
    const d0 = a.g - s.expectedAt(a.t);
    const d1 = b.g - s.expectedAt(b.t);
    const pa = [x(a.t), y(s.expectedAt(a.t))];
    const pb = [x(b.t), y(s.expectedAt(b.t))];
    const ra = [x(a.t), y(a.g)];
    const rb = [x(b.t), y(b.g)];
    if (d0 * d1 >= 0) {
      svg += shade([pa, pb, rb, ra], d0 + d1 >= 0 ? GREEN : RED);
    } else {
      const k = d0 / (d0 - d1);
      const t = a.t + (b.t - a.t) * k;
      const cross = [x(t), y(s.expectedAt(t))];
      svg += shade([pa, cross, ra], d0 > 0 ? GREEN : RED) + shade([cross, pb, rb], d1 > 0 ? GREEN : RED);
    }
  }

  svg += `<path d="${path([[x(s.startEff), y(0)], [x(range.end), y(s.endExpected)]])}" fill="none" stroke="${AMBER}" stroke-width="2.5"/>`;
  svg += `<path d="${path(real.map((p) => [x(p.t), y(p.g)]))}" fill="none" stroke="${GREEN}" stroke-width="3.5"/>`;
  svg += `<path d="${path([[nowX, y(s.gainedNow)], [x(range.end), y(s.endReal)]])}" fill="none" stroke="${GREEN}" stroke-width="3" stroke-dasharray="6 5"/>`;
  svg += `<circle cx="${nowX}" cy="${y(s.gainedNow)}" r="5" fill="${GREEN}"/></svg>`;

  return svg;
}

export function legendHtml() {
  const item = (swatch, text) => `<span>${swatch}${text}</span>`;
  const line = (color, extra = '') => `<i style="background: ${color}; ${extra}"></i>`;
  const dashed = `<i style="background: none; border-top: 3px dashed ${GREEN}; height: 0"></i>`;
  return `<div class="legend">${item(line(GREEN), 'Real')}${item(dashed, 'A tu ritmo')}${item(line(AMBER), 'Esperado')}${item(line(GREEN, 'opacity: .45; height: 8px'), 'Por encima')}${item(line(RED, 'opacity: .45; height: 8px'), 'Por debajo')}</div>`;
}
