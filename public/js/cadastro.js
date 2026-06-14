(function() {
  'use strict';

  let dadosCPF = null;
  let clientId = null;
  let currentStep = 1;
  const totalSteps = 4;

/* CPF mask */
const cpfInput = document.getElementById('cadCPF');
if (cpfInput) {
  cpfInput.addEventListener('input', function() {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    this.value = v.replace(/(\d{3})(\d)/, '$1.$2')
                  .replace(/(\d{3})(\d)/, '$1.$2')
                  .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    if (v.length === 11) {
      consultarCPFAutomatico(v);
    }
  });

  cpfInput.addEventListener('blur', function() {
    const cpf = this.value.replace(/\D/g, '');
    if (cpf.length === 11 && !dadosCPF) {
      consultarCPFAutomatico(cpf);
    }
  });
}
 
/* CEP mask and auto-complete */
const cepInput = document.getElementById('cadCEP');
if (cepInput) {
  // Máscara de CEP
  cepInput.addEventListener('input', function() {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    this.value = v.replace(/^(\d{5})(\d)/, '$1-$2');
  });
  
  // Lookup CEP quando perde o foco
  cepInput.addEventListener('blur', function() {
    const cep = this.value.replace(/\D/g, '');
    if (cep.length === 8) {
      preencherEnderecoPorCEP(cep);
    }
  });
}
 
/* CEP lookup via ViaCEP */
async function buscarCEP(cep) {
  // Remove não-dígitos
  const cepLimpo = cep.replace(/\D/g, '');
  
  // Validação básica
  if (!cepLimpo || cepLimpo.length !== 8) {
    return null;
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();
    
    // Verifica se o CEP foi encontrado
    if (data.erro) {
      return null;
    }
    
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || ''
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

async function preencherEnderecoPorCEP(cep) {
  const statusEl = document.createElement('small');
  statusEl.style.color = 'var(--text-muted)';
  statusEl.style.fontSize = '0.85rem';
  statusEl.style.display = 'block';
  statusEl.style.marginTop = '4px';
  
  // Adicionar status após o campo CEP
  const cepGroup = document.getElementById('cadCEP').parentElement;
  // Remover status anterior se existir
  const oldStatus = cepGroup.querySelector('small.status-cep');
  if (oldStatus) oldStatus.remove();
  
  statusEl.className = 'status-cep';
  statusEl.textContent = 'Buscando endereço...';
  cepGroup.appendChild(statusEl);
  
  try {
    const endereco = await buscarCEP(cep);
    
    if (endereco) {
      // Preencher os campos
      document.getElementById('cadEndereco').value = endereco.logradouro;
      document.getElementById('cadBairro').value = endereco.bairro;
      document.getElementById('cadCidade').value = endereco.localidade;
      document.getElementById('cadEstado').value = endereco.uf;
      
      statusEl.textContent = 'Endereço encontrado!';
      statusEl.style.color = 'var(--green-emerald)';
    } else {
      statusEl.textContent = 'CEP não encontrado. Verifique e tente novamente.';
      statusEl.style.color = '#EF4444';
      
      // Limpar campos se CEP inválido
      document.getElementById('cadEndereco').value = '';
      document.getElementById('cadBairro').value = '';
      document.getElementById('cadCidade').value = '';
      document.getElementById('cadEstado').value = '';
    }
  } catch (error) {
    statusEl.textContent = 'Erro ao buscar CEP. Tente novamente.';
    statusEl.style.color = '#EF4444';
    console.error('Erro CEP:', error);
  }
}

  async function consultarCPFAutomatico(cpf) {
    const status = document.getElementById('cpfStatus');
    if (!status) return;
    status.innerHTML = '<span style="color:var(--text-muted)">Consultando CPF...</span>';

    try {
      const data = await consultarCPF(cpf);
      dadosCPF = data;

      if (data.data) {
        const d = data.data;
        const nomeInput = document.getElementById('cadNome');
        const nascInput = document.getElementById('cadNascimento');
        const sexoSelect = document.getElementById('cadSexo');
        const maeInput = document.getElementById('cadNomeMae');

        if (nomeInput && d.NOME) nomeInput.value = d.NOME;
        if (nascInput && d.NASC) nascInput.value = d.NASC.split(' ')[0];
        if (sexoSelect && d.SEXO) sexoSelect.value = d.SEXO;
        if (maeInput && d.NOME_MAE) maeInput.value = d.NOME_MAE;

        /* Renda */
        const rendaInput = document.getElementById('cadRenda');
        if (rendaInput && d.RENDA) {
          const renda = parseFloat(d.RENDA.replace(',', '.'));
          if (!isNaN(renda)) rendaInput.value = renda;
        }

        /* Telefones sugeridos */
        const telefonesDiv = document.getElementById('telefonesSugeridos');
        const telefonesList = document.getElementById('telefonesList');
        if (telefonesDiv && telefonesList && data.telefones && data.telefones.length) {
          telefonesDiv.style.display = 'block';
          telefonesList.innerHTML = '';
          data.telefones.forEach((tel, idx) => {
            const label = document.createElement('label');
            label.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;cursor:pointer';
            label.innerHTML = `<input type="radio" name="telSugerido" value="${tel.DDD}|${tel.TELEFONE}" ${idx === 0 ? 'checked' : ''}>
              <span>${formatTelefone(tel.DDD, tel.TELEFONE)}</span>`;
            telefonesList.appendChild(label);
          });
        }

        status.innerHTML = '<span style="color:var(--green-emerald)">✓ CPF encontrado! Dados preenchidos automaticamente.</span>';
      } else {
        status.innerHTML = '<span style="color:var(--text-muted)">CPF não encontrado. Preencha manualmente.</span>';
      }
    } catch (err) {
      status.innerHTML = '<span style="color:#EF4444">Erro ao consultar CPF. Preencha manualmente.</span>';
    }
  }

  window.nextStep = function(step) {
    if (step === 2) {
      const nome = document.getElementById('cadNome').value.trim();
      const cpf = document.getElementById('cadCPF').value.replace(/\D/g, '');
      if (!nome) { alert('Nome é obrigatório'); return; }
      if (cpf.length !== 11) { alert('CPF inválido'); return; }
    }

    currentStep = step;
    updateSteps();
  };

  window.prevStep = function(step) {
    currentStep = step;
    updateSteps();
  };

  function updateSteps() {
    for (let i = 1; i <= totalSteps; i++) {
      const el = document.getElementById('step' + i);
      if (el) el.style.display = i === currentStep ? 'block' : 'none';
    }

    document.querySelectorAll('.step-dot').forEach(dot => {
      const s = parseInt(dot.dataset.step);
      dot.className = 'step-dot';
      if (s === currentStep) dot.classList.add('active');
      else if (s < currentStep) dot.classList.add('done');
    });

    if (currentStep === 4) {
      renderRevisao();
    }

    window.scrollTo({ top: 200, behavior: 'smooth' });
  }

  function renderRevisao() {
    const div = document.getElementById('revisaoDados');
    if (!div) return;

    const nome = document.getElementById('cadNome').value || '-';
    const cpf = document.getElementById('cadCPF').value || '-';
    const email = document.getElementById('cadEmail').value || '-';
    const celular = document.getElementById('cadCelular').value || '-';
    const renda = document.getElementById('cadRenda').value || '0';
    const endereco = document.getElementById('cadEndereco').value || '-';
    const cidade = document.getElementById('cadCidade').value || '-';
    const estado = document.getElementById('cadEstado').value || '-';

    const telRadios = document.querySelectorAll('input[name="telSugerido"]');
    let telSugerido = celular;
    telRadios.forEach(r => { if (r.checked) telSugerido = r.value.replace('|', ' '); });

    div.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><strong>Nome:</strong> ${nome}</div>
        <div><strong>CPF:</strong> ${cpf}</div>
        <div><strong>E-mail:</strong> ${email}</div>
        <div><strong>Celular:</strong> ${telSugerido}</div>
        <div><strong>Renda:</strong> R$ ${parseFloat(renda || 0).toFixed(2)}</div>
        <div><strong>Endereço:</strong> ${endereco}${cidade ? ', ' + cidade : ''}${estado ? ' - ' + estado : ''}</div>
      </div>
    `;

    /* Check for URL params from simulador */
    const params = new URLSearchParams(window.location.search);
    const valorParam = params.get('valor');
    const parcParam = params.get('parcelas');
    const propostasFields = document.getElementById('propostaFields');
    if (propostasFields) {
      if (valorParam || parcParam) {
        propostasFields.style.display = 'block';
        if (valorParam) document.getElementById('propValor').value = valorParam;
        if (parcParam) document.getElementById('propParcelas').value = parcParam;
      } else {
        propostasFields.style.display = 'block';
      }
    }
  }

  /* Finalizar cadastro */
  const finalizarBtn = document.getElementById('finalizarBtn');
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', async function() {
      const feedback = document.getElementById('cadastroFeedback');
      if (!feedback) return;

      this.disabled = true;
      this.textContent = 'Enviando...';

      const telRadios = document.querySelectorAll('input[name="telSugerido"]');
      let celular = document.getElementById('cadCelular').value;
      telRadios.forEach(r => { if (r.checked) celular = r.value.replace('|', ' '); });

      const pin = document.getElementById('cadPin').value;
      const pinConfirm = document.getElementById('cadPinConfirm').value;
      const pinError = document.getElementById('pinError');

      if (!pin || pin.length < 4) {
        pinError.textContent = 'Crie um PIN de 4 dígitos';
        pinError.style.display = 'block';
        this.disabled = false;
        this.textContent = 'Finalizar Cadastro →';
        return;
      }
      if (pin !== pinConfirm) {
        pinError.textContent = 'Os PINs não conferem';
        pinError.style.display = 'block';
        this.disabled = false;
        this.textContent = 'Finalizar Cadastro →';
        return;
      }
      pinError.style.display = 'none';

      const payload = {
        nome: document.getElementById('cadNome').value.trim(),
        cpf: document.getElementById('cadCPF').value.replace(/\D/g, ''),
        email: document.getElementById('cadEmail').value.trim(),
        celular: celular,
        data_nascimento: document.getElementById('cadNascimento').value,
        sexo: document.getElementById('cadSexo').value,
        nome_mae: document.getElementById('cadNomeMae').value,
        renda: parseFloat(document.getElementById('cadRenda').value) || 0,
        cep: document.getElementById('cadCEP').value,
        endereco: document.getElementById('cadEndereco').value,
        bairro: document.getElementById('cadBairro').value,
        cidade: document.getElementById('cadCidade').value,
        estado: document.getElementById('cadEstado').value,
        score: dadosCPF?.scores?.[0]?.CSBA || 0,
        pin: pin
      };

      if (!payload.nome || payload.cpf.length !== 11) {
        feedback.innerHTML = '<div class="alert alert-error">Nome e CPF são obrigatórios</div>';
        this.disabled = false;
        this.textContent = 'Finalizar Cadastro →';
        return;
      }

      try {
        const result = await api.post('/api/clientes', payload);
        clientId = result.cliente.id;
        feedback.innerHTML = '<div class="alert alert-success">✓ Cadastro realizado com sucesso!</div>';

        /* If proposal fields filled, create proposal */
        const propValor = document.getElementById('propValor');
        const propParcelas = document.getElementById('propParcelas');
        if (propValor && propParcelas && parseFloat(propValor.value) >= 500) {
          const valor = parseFloat(propValor.value);
          const parcelas = parseInt(propParcelas.value);
          const taxa = 3.5 / 100;
          const valorParcela = valor * (taxa * Math.pow(1 + taxa, parcelas)) / (Math.pow(1 + taxa, parcelas) - 1);

          const proposta = await api.post('/api/propostas', {
            cliente_id: clientId,
            valor, parcelas, taxa_juros: 3.5, cet: 3.8,
            valor_parcela: Math.round(valorParcela * 100) / 100
          });

          feedback.innerHTML += `<div class="alert alert-success" style="margin-top:8px">✓ Proposta #${proposta.proposta.id} criada! <a href="proposta.html" style="color:var(--green-emerald);font-weight:600">Acompanhar →</a></div>`;

          /* Gerar cobrança */
          try {
            const cobranca = await api.post('/api/cobranca/gerar', {
              proposta_id: proposta.proposta.id,
              valor: 29.90
            });
            feedback.innerHTML += `
              <div class="alert alert-info" style="margin-top:8px">
                Taxa de R$ 29,90 gerada. <a href="proposta.html" style="color:var(--teal-deep);font-weight:600">Pagar agora →</a>
              </div>
            `;
          } catch {}
        }

        this.textContent = '✓ Finalizado';

        const loginResp = await api.post('/api/cliente/login', { cpf: payload.cpf, pin: payload.pin });
        localStorage.setItem('finanflex_cliente_token', loginResp.token);
        localStorage.setItem('finanflex_cliente_dados', JSON.stringify(loginResp.cliente));

        setTimeout(() => {
          window.location.href = `minha-conta.html`;
        }, 2000);
      } catch (err) {
        feedback.innerHTML = `<div class="alert alert-error">${err.message || 'Erro ao cadastrar'}</div>`;
        this.disabled = false;
        this.textContent = 'Finalizar Cadastro →';
      }
    });
  }

  /* Init */
  updateSteps();

  const urlParams = new URLSearchParams(window.location.search);
  const cpfParam = urlParams.get('cpf');
  if (cpfParam && cpfParam.length === 11) {
    const formatted = cpfParam.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    const cpfInputEl = document.getElementById('cadCPF');
    if (cpfInputEl) {
      cpfInputEl.value = formatted;
      consultarCPFAutomatico(cpfParam);
    }
  }
})();
