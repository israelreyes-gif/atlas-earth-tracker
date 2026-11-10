import { getAll } from './getAll.js';
import { getHistory } from './getHistory.js';
import { saveState } from './saveState.js';

// Acción que envía la app -> función que la atiende.
export const handlers = { getAll, getHistory, saveState };
