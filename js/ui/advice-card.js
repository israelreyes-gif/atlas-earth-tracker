// Zona de consejos del inicio: dos tarjetas de color, DINERO y ATLAS.
import { moneyCardHtml } from './advice-money.js';
import { atlasCardHtml } from './advice-atlas.js';

export function adviceHtml() {
  return '<section class="advice-grid" id="advice" aria-label="Qué hago con mi dinero"></section>';
}

export function refreshAdvice(root, advice, balance) {
  root.querySelector('#advice').innerHTML = moneyCardHtml(advice.withdraw, balance) + atlasCardHtml(advice.target);
}
