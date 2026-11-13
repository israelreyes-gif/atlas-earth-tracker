// Tarjeta verde de arriba: renta total acumulada, saldo disponible, invertido y retirado (se mueve cada segundo).
import { estimate } from '../calc.js';
import { formatDollar } from '../format.js';
import { currentMultiplier, state } from '../store.js';
import { correctedNotice } from './corrected.js';

export function heroHtml() {
  return `
    <section class="hero" aria-label="Dinero">
      <span class="soft">Renta total acumulada</span>
      <span class="num hero-total" id="hero-total"></span>
      <span class="soft">Saldo disponible</span>
      <span class="num hero-balance" id="hero-balance"></span>
      <div class="hero-spent">
        <div class="hero-spent-item">
          <span class="soft">Invertido</span>
          <span class="num" id="hero-spent"></span>
        </div>
        <div class="hero-spent-item right">
          <span class="soft">Retirado</span>
          <span class="num" id="hero-withdrawn"></span>
        </div>
      </div>
      <a class="hero-link" href="#money">Corregir con las cifras del juego</a>
      <span class="hero-corrected" id="hero-corrected"></span>
    </section>`;
}

// Pone las cifras al instante actual. Se llama cada segundo.
export function tickHero(root) {
  const value = estimate(state.account, state.types, currentMultiplier(), new Date());
  root.querySelector('#hero-total').textContent = formatDollar(value.total, 8);
  root.querySelector('#hero-balance').textContent = formatDollar(value.balance, 8);
  root.querySelector('#hero-spent').textContent = formatDollar(value.spent, 2);
  root.querySelector('#hero-withdrawn').textContent = formatDollar(value.withdrawn, 2);
  const notice = correctedNotice(state.account, new Date());
  const note = root.querySelector('#hero-corrected');
  note.textContent = notice.stale ? `⚠ ${notice.text}` : notice.text;
  note.classList.toggle('stale', notice.stale);
}
