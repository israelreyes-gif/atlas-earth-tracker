// Cambios de la configuración (parcelas, insignias, boosts, gastado): se aplican al estado y se guardan con espera.
import { BOOST_MAX_SECONDS, BOOST_STEP_SECONDS, boostRemaining, freezeAccount } from './calc.js';
import { currentMultiplier, persist, state } from './store.js';

const SAVE_DELAY_MS = 800;

// onChange se llama después de cada cambio para repintar. status y retry son los elementos de estado de la pantalla.
export function createEditor({ status, retry, onChange }) {
  let timer = null;
  let queue = Promise.resolve();

  // Guarda en orden: cada guardado espera al anterior.
  function save() {
    timer = null;
    status.textContent = 'Guardando…';
    retry.hidden = true;
    queue = queue.then(async () => {
      try {
        await persist();
        status.textContent = 'Guardado';
      } catch (error) {
        status.textContent = `No se pudo guardar: ${error.message}`;
        retry.hidden = false;
      }
    });
  }

  // Se fija el dinero (y lo que queda de boost) hasta ahora y desde aquí cuenta con el nuevo ritmo.
  function freezeMoney() {
    state.account = freezeAccount(state.account, state.types, currentMultiplier(), new Date());
  }

  function afterChange() {
    onChange();
    status.textContent = 'Cambios sin guardar…';
    clearTimeout(timer);
    timer = setTimeout(save, SAVE_DELAY_MS);
  }

  function changeParcels(typeId, delta) {
    const type = state.types.find((item) => item.id === typeId);
    const next = Math.max(0, type.count + delta);
    if (next === type.count) return;
    freezeMoney();
    type.count = next;
    afterChange();
  }

  function changeBadges(delta) {
    freezeMoney();
    state.account.badges += delta;
    afterChange();
  }

  // + suma una hora al boost (solo si no hay otro tipo activo y sin pasar de 5 h); − quita una hora.
  function changeBoost(type, delta) {
    freezeMoney();
    const left = boostRemaining(state.account, new Date(state.account.updated_at));
    const active = left > 0 ? state.account.boost_type : 0;
    if (delta > 0 && active !== 0 && active !== type) return;
    if (delta < 0 && active !== type) return;
    const next = Math.max(0, left + delta * BOOST_STEP_SECONDS);
    if (next > BOOST_MAX_SECONDS) return;
    state.account = { ...state.account, boost_type: next > 0 ? type : 0, boost_seconds: next };
    afterChange();
  }

  // Apunta un gasto (+) o lo corrige (−): el total no cambia, el saldo baja o sube.
  function changeSpent(delta) {
    freezeMoney();
    const balance = state.account.total_earned - state.account.spent;
    if (delta > 0 && balance < delta) return;
    const next = Math.max(0, state.account.spent + delta);
    if (next === state.account.spent) return;
    state.account = { ...state.account, spent: next };
    afterChange();
  }

  // Al salir de la pantalla: si hay un cambio esperando, se guarda ya.
  function flush() {
    if (!timer) return;
    clearTimeout(timer);
    persist().catch(() => {});
  }

  return { changeParcels, changeBadges, changeBoost, changeSpent, save, flush };
}
