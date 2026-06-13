const api = {
  baseUrl: '',

  async request(method, url, body, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem('finanflex_token');
      if (!token) throw new Error('Unauthorized');
      headers['Authorization'] = `Bearer ${token}`;
    }
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const response = await fetch(this.baseUrl + url, opts);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
  },

  get(url) { return this.request('GET', url); },
  post(url, body) { return this.request('POST', url, body); },
  put(url, body) { return this.request('PUT', url, body); },
  authGet(url) { return this.request('GET', url, null, true); },
  authPut(url, body) { return this.request('PUT', url, body, true); },
};

async function consultarCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) throw new Error('CPF inválido');
  return api.post('/api/consulta-cpf', { cpf: cpfLimpo });
}

function formatCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatTelefone(ddd, tel) {
  const t = String(tel);
  if (t.length === 8) return `(${ddd}) ${t.slice(0,4)}-${t.slice(4)}`;
  if (t.length === 9) return `(${ddd}) ${t.slice(0,5)}-${t.slice(5)}`;
  return `(${ddd}) ${t}`;
}

function formatMoney(valor) {
  return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}
