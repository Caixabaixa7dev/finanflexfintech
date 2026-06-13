const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const getDb = require('./database/database');

async function start() {
  await getDb();

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/clientes', require('./routes/clientes'));
  app.use('/api/propostas', require('./routes/propostas'));
  app.use('/api/consulta-cpf', require('./routes/cpf'));
  app.use('/api/cobranca', require('./routes/pagamento'));
  app.use('/api/admin', require('./routes/dashboard'));
  app.use('/api/cliente', require('./routes/cliente'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'FinanFlex' });
  });

  app.listen(config.port, () => {
    console.log(`FinanFlex rodando em http://localhost:${config.port}`);
  });
}

start().catch(err => {
  console.error('Erro ao iniciar:', err);
  process.exit(1);
});
