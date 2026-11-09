// Tarjeta verde de arriba: renta total acumulada, saldo disponible y gastado (se mueve cada segundo).
import { estimate } from '../calc.js';
import { formatDollar } from '../format.js';
import { currentMultiplier, state } from '../store.js';

export function heroHtml() {
  return `
    <section class="hero" aria-label="Dinero">
      <span class="soft">Renta total acumulada</span>
      <span class="num hero-total" id="hero-total"></span>
      <span class="soft">Saldo disponible</span>
      <span class="num hero-balance" id="hero-balance"></span>
      <div class="hero-spent">
        <span class="soft">Gastado</span>
        <span class="num" id="hero-spent"></span>
      </div>
      <a class="hero-link" href="#money">Corregir con las cifras del juego</a>
    </section>`;
}

// Pone las cifras al instante actual. Se llama cada segundo.
export function tickHero(root) {
  const value = estimate(state.account, state.types, currentMultiplier(), new Date());
  root.querySelector('#hero-total').textContent = formatDollar(value.total, 8);
  root.querySelector('#hero-balance').textContent = formatDollar(value.balance, 8);
  root.querySelector('#hero-spent').textContent = formatDollar(value.spent, 2);
}
