// Tarjeta "¿Qué hago con mi dinero?": tres consejos (retirar, AB gratis y canjear dólares).
import { formatDollar, formatNumber } from '../format.js';
import { RULES } from '../rules.js';

export function adviceHtml() {
  return `
    <section class="card compact advice" aria-label="Qué hago con mi dinero">
      <h2>¿Qué hago con mi dinero?</h2>
      <p class="advice-line"><b>Dólares</b> <span id="advice-withdraw"></span></p>
      <p class="advice-line"><b>AB gratis</b> <span id="advice-target"></span></p>
      <p class="advice-line"><b>Canjear $ por AB</b> <span id="advice-convert"></span></p>
    </section>`;
}

function duration(days) {
  if (days >= 730) return `${formatNumber(days / 365, 0)} años`;
  if (days >= 60) return `${formatNumber(days / 30.44, 0)} meses`;
  return `${formatNumber(days, 0)} días`;
}

function withdrawText(withdraw) {
  if (withdraw.canWithdraw) return `ya llegas al mínimo de ${RULES.minimumWithdrawal} $: puedes retirar.`;
  const time = withdraw.days === null ? '' : ` (unos ${duration(withdraw.days)} sin boost)`;
  return `guárdalos y retira al llegar a ${RULES.minimumWithdrawal} $. Faltan ${formatDollar(withdraw.missing)}${time}.`;
}

function targetText(target) {
  if (target.kind === 'max') return 'insignias al máximo: gástalos en parcelas.';
  const { step } = target;
  const gain = formatNumber(Math.round((step.bonusNext - step.bonusNow) * 100), 0);
  if (target.kind === 'badges') {
    return `ve a por el escalón: faltan ${formatNumber(step.missing)} insignias (${formatNumber(step.costAB)} AB) para +${gain} %.`;
  }
  return `compra parcelas. Las insignias compensarán al ganar ${formatDollar(target.breakEven, 3)} al día (ahora ${formatDollar(target.baseDaily, 3)}).`;
}

function convertText(convert) {
  if (convert.paybackDays === null) return 'sin parcelas que rindan no hay nada que calcular.';
  if (convert.worth) return `compensa: recuperas el dólar en ${duration(convert.paybackDays)}.`;
  return `no compensa en dinero: tardarías ${duration(convert.paybackDays)} en recuperar cada dólar.`;
}

export function refreshAdvice(root, advice) {
  root.querySelector('#advice-withdraw').textContent = withdrawText(advice.withdraw);
  root.querySelector('#advice-target').textContent = targetText(advice.target);
  root.querySelector('#advice-convert').textContent = convertText(advice.convert);
}
