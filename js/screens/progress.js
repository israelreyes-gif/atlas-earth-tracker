// Progresión: lo ganado en el periodo elegido (Hoy, Mes, 3 meses, Año) frente a lo esperado.
import { api } from '../api.js';
import { PERIODS } from '../progress/period.js';
import { buildProgress } from '../progress/series.js';
import { currentMultiplier, state } from '../store.js';
import { chartHtml } from '../ui/progress-chart.js';
import { deviationHtml, endHtml } from '../ui/progress-cards.js';

const BACK = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';

let selected = 'mes';

export function renderProgress(container) {
  container.innerHTML = `
    <div class="row">
      <a class="icon-btn" href="#home" aria-label="Volver al inicio">${BACK}</a>
      <h1>Progresión</h1>
    </div>
    <div class="seg" role="group" aria-label="Periodo">
      ${PERIODS.map((p) => `<button type="button" data-period="${p.key}" aria-pressed="${p.key === selected}" style="padding: 0 4px">${p.label}</button>`).join('')}
    </div>
    <div id="progress-body" class="progress-body"><p class="muted">Cargando…</p></div>`;

  const body = container.querySelector('#progress-body');
  let points = null;
  let alive = true;

  function draw() {
    if (points === null) return;
    const series = buildProgress({
      points,
      account: state.account,
      types: state.types,
      multiplier: currentMultiplier(),
      now: new Date(),
      key: selected,
    });
    if (!series) {
      body.innerHTML = '<div class="card"><p>Aún no hay historial.</p><p class="muted">Se va llenando cada vez que cambias algo en Configuración (parcelas, insignias, boosts, gasto) o corriges el dinero.</p></div>';
      return;
    }
    const title = PERIODS.find((p) => p.key === selected).endName;
    body.innerHTML = `
      ${deviationHtml(series)}
      <section class="card" style="padding: 12px"><h2>Real frente a esperado</h2>${chartHtml(series)}</section>
      ${endHtml(series, title)}`;
  }

  async function load() {
    try {
      points = (await api.getHistory()).points;
      if (alive) draw();
    } catch (error) {
      if (!alive) return;
      body.innerHTML = `<div class="card"><p>No se pudo cargar el historial.</p><p class="muted">${error.message}</p><button class="btn btn-light btn-small" type="button" id="retry-history">Reintentar</button></div>`;
      body.querySelector('#retry-history').addEventListener('click', load);
    }
  }

  container.querySelectorAll('[data-period]').forEach((button) => {
    button.addEventListener('click', () => {
      selected = button.dataset.period;
      container.querySelectorAll('[data-period]').forEach((other) => {
        other.setAttribute('aria-pressed', String(other === button));
      });
      draw();
    });
  });

  load();
  const refresh = setInterval(draw, 30000);
  return () => {
    alive = false;
    clearInterval(refresh);
  };
}
