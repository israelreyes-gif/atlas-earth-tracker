// Objetivos: fecha estimada para cada meta según el ritmo de compra.
import { estimatedBalance, filterByMonths, incomePerParcel, latestSnapshot, purchasePace } from '../calc.js';
import { buildGoalInfo, euroTarget } from '../goal-info.js';
import { escapeHtml } from '../html.js';
import { formatNumber, parseNumber } from '../format.js';
import { addGoal, removeGoal, state } from '../store.js';
import { emptyHtml } from './empty.js';

const TYPE_LABELS = {
  money: 'Juntar dinero (€)',
  parcels: 'Número de parcelas',
  income: 'Ganancia diaria (€)',
};

function goalCard(goal, info) {
  const removeButton = goal.id === null
    ? ''
    : `<button class="link-btn" type="button" data-remove="${goal.id}">Quitar objetivo</button>`;
  return `
    <article class="card">
      <div class="row between baseline">
        <span class="title">${escapeHtml(info.title)}</span>
        <span class="when">${escapeHtml(info.when)}</span>
      </div>
      <div class="bar"><i style="width: ${(info.progress * 100).toFixed(1)}%"></i></div>
      <span class="muted">${escapeHtml(info.detail)}</span>
      ${removeButton}
    </article>`;
}

export function renderGoals(container) {
  const snapshot = latestSnapshot(state.snapshots);
  if (!snapshot) {
    container.innerHTML = emptyHtml('Objetivos');
    return;
  }

  const now = new Date();
  const threshold = state.settings.withdraw_threshold;
  let pace = Math.round(purchasePace(filterByMonths(state.snapshots, 12, now))) || 5;
  let adding = false;

  function listHtml() {
    const context = {
      snapshot,
      balance: estimatedBalance(snapshot, now),
      perParcel: incomePerParcel(snapshot),
      pace,
      now,
    };
    const withdraw = { id: null, type: 'money', target: threshold, title: `Retirar ${euroTarget(threshold)}` };
    return [withdraw, ...state.goals]
      .map((goal) => goalCard(goal, buildGoalInfo(goal, context)))
      .join('');
  }

  function drawList() {
    const list = container.querySelector('#goal-list');
    list.innerHTML = listHtml();
    list.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          await removeGoal(Number(button.dataset.remove));
        } catch (error) {
          alert(`No se pudo quitar: ${error.message}`);
        }
        draw();
      });
    });
  }

  function drawForm() {
    container.innerHTML = `
      <h1>Nuevo objetivo</h1>
      <form class="card" id="goal-form" novalidate>
        <div class="field">
          <label for="type">Tipo</label>
          <select id="type">
            ${Object.entries(TYPE_LABELS).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="target">Meta</label>
          <input id="target" inputmode="decimal" required>
        </div>
        <p class="error" id="message" role="alert"></p>
        <button class="btn btn-dark" type="submit">Guardar</button>
        <button class="btn btn-light" type="button" id="cancel">Cancelar</button>
      </form>`;

    container.querySelector('#cancel').addEventListener('click', () => {
      adding = false;
      draw();
    });

    const form = container.querySelector('#goal-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const target = parseNumber(container.querySelector('#target').value);
      const type = container.querySelector('#type').value;
      const message = container.querySelector('#message');
      if (!(target > 0) || (type === 'parcels' && !Number.isInteger(target))) {
        message.textContent = 'Escribe una meta válida (las parcelas, en número entero).';
        return;
      }
      form.querySelector('button').disabled = true;
      try {
        await addGoal({ type, target });
        adding = false;
        draw();
      } catch (error) {
        message.textContent = `No se pudo guardar: ${error.message}`;
        form.querySelector('button').disabled = false;
      }
    });
  }

  function draw() {
    if (adding) {
      drawForm();
      return;
    }
    container.innerHTML = `
      <div class="row between">
        <h1>Objetivos</h1>
        <button class="btn btn-dark btn-small" type="button" id="new-goal">+ Nuevo</button>
      </div>
      <section class="card">
        <div class="row between baseline">
          <label for="pace" class="title" style="font-size: 14px">Ritmo de compra</label>
          <span class="num" id="pace-value" style="color: var(--green)"></span>
        </div>
        <input id="pace" type="range" min="0" max="60" step="1" value="${pace}">
        <span class="muted small">Las fechas se recalculan con este ritmo</span>
      </section>
      <div id="goal-list" style="display: flex; flex-direction: column; gap: 14px"></div>`;

    const paceValue = container.querySelector('#pace-value');
    const slider = container.querySelector('#pace');
    const showPace = () => { paceValue.textContent = `${formatNumber(pace)} parcelas/mes`; };

    slider.addEventListener('input', () => {
      pace = Number(slider.value);
      showPace();
      drawList();
    });
    container.querySelector('#new-goal').addEventListener('click', () => {
      adding = true;
      draw();
    });

    showPace();
    drawList();
  }

  draw();
}
