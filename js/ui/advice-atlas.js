// Tarjeta ATLAS: PARCELAS o INSIGNIAS según lo que rinda más con los AB.
import { formatNumber } from '../format.js';

function view(target) {
  if (target.kind === 'max') return { cls: 'parcels', word: 'PARCELAS', progress: 1, sub: 'insignias al máximo' };
  if (target.kind === 'badges') {
    const { step } = target;
    return { cls: 'badges', word: 'INSIGNIAS', progress: 1, sub: `faltan ${formatNumber(step.missing)} · ${formatNumber(step.costAB)} AB` };
  }
  const progress = Math.min(1, target.baseDaily / target.breakEven);
  return { cls: 'parcels', word: 'PARCELAS', progress, sub: `${formatNumber(Math.round(progress * 100))} % para insignias` };
}

export function atlasCardHtml(target) {
  const v = view(target);
  return `
    <div class="advice-card atlas ${v.cls}">
      <span class="advice-title">ATLAS</span>
      <span class="advice-word">${v.word}</span>
      <div class="advice-bar"><i style="width:${(v.progress * 100).toFixed(0)}%"></i></div>
      <span class="advice-sub">${v.sub}</span>
    </div>`;
}
