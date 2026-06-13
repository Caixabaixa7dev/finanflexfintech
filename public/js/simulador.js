(function() {
  'use strict';

  const simValor = document.getElementById('simValor');
  const simParcelas = document.getElementById('simParcelas');
  const simTaxa = document.getElementById('simTaxa');
  const recalcularBtn = document.getElementById('recalcularBtn');
  const solicitarBtn = document.getElementById('solicitarBtn');

  function calcular() {
    const valor = parseInt(simValor.value) || 2000;
    const parcelas = parseInt(simParcelas.value) || 12;
    const taxaMensal = (parseFloat(simTaxa.value) || 3.5) / 100;

    document.getElementById('simValorDisplay').textContent = formatMoney(valor);
    document.getElementById('simParcelasDisplay').textContent = parcelas + ' meses';

    const parcelaValor = valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) / (Math.pow(1 + taxaMensal, parcelas) - 1);

    document.getElementById('resValor').textContent = formatMoney(valor);
    document.getElementById('resParcelas').textContent = parcelas + 'x';
    document.getElementById('resParcela').textContent = formatMoney(parcelaValor);
    document.getElementById('resTotal').textContent = formatMoney(parcelaValor * parcelas);
    document.getElementById('resTaxa').textContent = (taxaMensal * 100).toFixed(2) + '% a.m.';
    document.getElementById('resCet').textContent = (taxaMensal * 100 + 0.3).toFixed(2) + '% a.m.';

    if (solicitarBtn) {
      solicitarBtn.href = `cadastro.html?valor=${valor}&parcelas=${parcelas}`;
    }

    /* Tabela de amortização */
    const tbody = document.getElementById('tabelaAmortizacao');
    if (!tbody) return;

    let saldo = valor;
    let html = '';
    for (let i = 1; i <= parcelas && i <= 24; i++) {
      const juros = saldo * taxaMensal;
      const amortizacao = parcelaValor - juros;
      saldo -= amortizacao;
      if (Math.abs(saldo) < 0.01) saldo = 0;

      html += `<tr>
        <td>${i}</td>
        <td>${formatMoney(parcelaValor)}</td>
        <td>${formatMoney(juros)}</td>
        <td>${formatMoney(amortizacao)}</td>
        <td>${formatMoney(Math.max(0, saldo))}</td>
      </tr>`;
    }
    tbody.innerHTML = html;
  }

  if (simValor) simValor.addEventListener('input', calcular);
  if (simParcelas) simParcelas.addEventListener('input', calcular);
  if (recalcularBtn) recalcularBtn.addEventListener('click', calcular);
  if (simTaxa) simTaxa.addEventListener('change', calcular);

  calcular();
})();
