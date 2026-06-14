CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  telefone TEXT DEFAULT '',
  celular TEXT DEFAULT '',
  data_nascimento TEXT DEFAULT '',
  sexo TEXT DEFAULT '',
  nome_mae TEXT DEFAULT '',
  renda REAL DEFAULT 0,
  cep TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  score INTEGER DEFAULT 0,
  pin TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS propostas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  valor REAL NOT NULL,
  parcelas INTEGER NOT NULL,
  taxa_juros REAL DEFAULT 0,
  cet REAL DEFAULT 0,
  valor_parcela REAL DEFAULT 0,
  status TEXT DEFAULT 'pendente',
  observacao TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cobrancas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proposta_id INTEGER NOT NULL,
  valor REAL NOT NULL,
  qrcode TEXT DEFAULT '',
  qrcode_txid TEXT DEFAULT '',
  copia_e_cola TEXT DEFAULT '',
  status TEXT DEFAULT 'pendente',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposta_id) REFERENCES propostas(id)
);
