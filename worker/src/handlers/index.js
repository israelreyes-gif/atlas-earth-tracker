import { getAll } from './getAll.js';
import { saveState } from './saveState.js';

// Acción que envía la app -> función que la atiende.
export const handlers = { getAll, saveState };
