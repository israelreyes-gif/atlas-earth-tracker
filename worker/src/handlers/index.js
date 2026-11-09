import { addGoal } from './addGoal.js';
import { addSnapshot } from './addSnapshot.js';
import { deleteGoal } from './deleteGoal.js';
import { deleteSnapshot } from './deleteSnapshot.js';
import { getAll } from './getAll.js';
import { saveSettings } from './saveSettings.js';

// Acción que envía la app -> función que la atiende.
export const handlers = {
  getAll,
  addSnapshot,
  deleteSnapshot,
  addGoal,
  deleteGoal,
  saveSettings,
};
