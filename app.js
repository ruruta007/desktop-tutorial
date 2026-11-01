(() => {
  const result = document.querySelector('#result');
  const expression = document.querySelector('#expression');
  let input = '0', stored = null, operator = null, fresh = false, lastOperation = null, line = '', error = false;
  const format = value => {
    if (!Number.isFinite(value)) throw new Error('計算できません');
    return String(Number(value.toPrecision(12)));
  };
  const calculate = (a, op, b) => {
    if (op === '÷' && b === 0) throw new Error('0では割れません');
    return format(op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b);
  };
  const render = () => {
    result.textContent = input;
    result.classList.toggle('small', input.length > 12);
    result.classList.toggle('error', error);
    expression.textContent = line || '\u00a0';
    document.querySelectorAll('[data-action="operator"]').forEach(button => {
      const selected = operator === button.dataset.value;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  };
  const clear = () => { input = '0'; stored = null; operator = null; fresh = false; lastOperation = null; line = ''; error = false; };
  const act = (action, value) => {
    try {
      if (action === 'clear') clear();
      else {
        if (error) clear();
        if (action === 'digit') {
          if (fresh) { input = '0'; fresh = false; if (!operator) line = ''; }
          if (value === '.') { if (!input.includes('.') && !input.includes('e')) input += '.'; }
          else if (input.replace(/[-.]/g, '').length < 12) input = input === '0' ? value : input === '-0' ? '-' + value : input + value;
          lastOperation = null;
        } else if (action === 'operator') {
          if (operator && !fresh) input = calculate(stored, operator, Number(input));
          stored = Number(input); operator = value; line = `${input} ${operator}`; fresh = true; lastOperation = null;
        } else if (action === 'equals') {
          if (operator) {
            const b = Number(input); line = `${stored} ${operator} ${input} =`;
            input = calculate(stored, operator, b); lastOperation = { operator, b }; operator = null; stored = null; fresh = true;
          } else if (lastOperation) {
            line = `${input} ${lastOperation.operator} ${lastOperation.b} =`;
            input = calculate(Number(input), lastOperation.operator, lastOperation.b); fresh = true;
          }
        } else if (action === 'sign') {
          input = input.startsWith('-') ? input.slice(1) : input === '0' ? '0' : '-' + input;
          if (fresh && operator) fresh = false;
          lastOperation = null;
        } else if (action === 'percent') {
          input = format(Number(input) / 100); fresh = false; lastOperation = null;
          if (!operator) line = '';
        } else if (action === 'delete') {
          if (fresh) { if (operator) return; line = ''; fresh = false; }
          input = input.includes('e') ? '0' : input.slice(0, -1);
          if (!input || input === '-') input = '0';
          lastOperation = null;
        }
      }
    } catch (e) { clear(); input = e.message; error = true; fresh = true; }
    render();
  };
  document.querySelector('.keys').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button) act(button.dataset.action || 'digit', button.dataset.value);
  });
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const key = event.key;
    const operators = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    let action, value;
    if (/^[0-9.]$/.test(key)) { action = 'digit'; value = key; }
    else if (operators[key]) { action = 'operator'; value = operators[key]; }
    else if (key === 'Enter' || key === '=') action = 'equals';
    else if (key === 'Escape' || key === 'Delete') action = 'clear';
    else if (key === 'Backspace') action = 'delete';
    else if (key === '%') action = 'percent';
    if (action) { event.preventDefault(); act(action, value); }
  });
  render();
})();
