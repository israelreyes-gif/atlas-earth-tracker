// Pantalla cuando todavía no hay ningún registro.
import { escapeHtml } from '../html.js';

export function emptyHtml(title) {
  return `
    <h1>${escapeHtml(title)}</h1>
    <div class="card">
      <p>Aún no hay datos. Apunta tus parcelas para empezar.</p>
      <a class="btn btn-dark" href="#update">Añadir mis parcelas</a>
    </div>`;
}
