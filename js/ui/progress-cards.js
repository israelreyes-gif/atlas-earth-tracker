// Tarjetas de Progresión: desviación (arriba) y resumen al final del periodo (debajo).
import { formatDollar, formatNumber } from '../format.js';

const sign = (value) => (value >= 0 ? '+' : '−');

export function deviationHtml(s) {
  const below = s.deviation < 0;
  const color = below ? '#A12B2B' : '#1B6E45';
  const soft = below ? '#F7DEDA' : '#DCEBE1';
  const pct = formatNumber(Math.abs(s.deviationPct), 0);
  return `
    <section class="card compact" aria-label="Desviación">
      <span class="muted small">Respecto a lo esperado</span>
      <div class="row between">
        <span class="num" style="font-size: 28px; color: ${color}">${sign(s.deviation)}${formatDollar(Math.abs(s.deviation), 3)}</span>
        <span class="pill" style="background: ${soft}; color: ${color}">${pct} % ${below ? 'por debajo' : 'por encima'}</span>
      </div>
      <span class="muted small">${formatNumber(s.hoursDone, 1)} h de boost de las ${formatNumber(s.hoursExpected, 1)} h que tocaban · esperado calculado con ${formatNumber(s.referenceDays, 1)} días</span>
    </section>`;
}

export function endHtml(s, title) {
  const diff = s.endReal - s.endExpected;
  const color = diff < 0 ? '#A12B2B' : '#1B6E45';
  return `
    <section class="card compact" aria-label="${title}">
      <h2>${title}</h2>
      <div class="breakdown-row"><span>Esperado (boosts anteriores)</span><b class="num">${formatDollar(s.endExpected)}</b></div>
      <div class="breakdown-row"><span>Si sigues a tu ritmo real</span><b class="num">${formatDollar(s.endReal)}</b></div>
      <div class="breakdown-row" style="border-top: 1px solid var(--line); padding-top: 8px"><span>Diferencia prevista</span><b class="num" style="color: ${color}">${sign(diff)}${formatDollar(Math.abs(diff))}</b></div>
    </section>`;
}
