const express = require('express');
const getDb = require('../database/database');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { cliente_id, valor, parcelas, taxa_juros, cet, valor_parcela } = req.body;

    if (!cliente_id || !valor || !parcelas) {
      return res.status(400).json({ error: 'cliente_id, valor e parcelas são obrigatórios' });
    }

    db.run(`
      INSERT INTO propostas (cliente_id, valor, parcelas, taxa_juros, cet, valor_parcela, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pendente')
    `, [cliente_id, valor, parcelas, taxa_juros || 0, cet || 0, valor_parcela || 0]);

    const proposta = db.get('SELECT * FROM propostas WHERE id = ?', [db.lastInsertRowid]);
    res.status(201).json({ proposta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';

    let query = `
      SELECT p.*, c.nome as cliente_nome, c.cpf as cliente_cpf,
        (SELECT cob.status FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_status,
        (SELECT cob.valor FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_valor
      FROM propostas p
      LEFT JOIN clientes c ON p.cliente_id = c.id
    `;
    const conditions = [];
    const params = [];
    const countParams = [];

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
      countParams.push(status);
    }
    if (search) {
      conditions.push('(c.nome LIKE ? OR c.cpf LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s);
      countParams.push(s, s);
    }

    if (conditions.length) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const propostas = db.all(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM propostas p LEFT JOIN clientes c ON p.cliente_id = c.id';
    if (conditions.length) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const { total } = countParams.length
      ? db.get(countQuery, countParams)
      : db.get('SELECT COUNT(*) as total FROM propostas');

    res.json({ propostas, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const proposta = db.get(`
      SELECT p.*, c.nome as cliente_nome, c.cpf as cliente_cpf, c.email, c.telefone, c.celular, c.renda,
        (SELECT cob.id FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_id,
        (SELECT cob.status FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_status,
        (SELECT cob.valor FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_valor
      FROM propostas p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!proposta) return res.status(404).json({ error: 'Proposta não encontrada' });
    res.json({ proposta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { status, observacao } = req.body;
    const validStatus = ['pendente', 'pago', 'em_analise', 'aprovado', 'rejeitado', 'cancelado'];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const proposta = db.get('SELECT * FROM propostas WHERE id = ?', [req.params.id]);
    if (!proposta) return res.status(404).json({ error: 'Proposta não encontrada' });

    db.run('UPDATE propostas SET status = ?, observacao = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, observacao || '', req.params.id]);

    const updated = db.get('SELECT * FROM propostas WHERE id = ?', [req.params.id]);
    res.json({ proposta: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const db = await getDb();
    const hoje = new Date().toISOString().split('T')[0];

    const totalPropostas = db.get('SELECT COUNT(*) as total FROM propostas').total;
    const pendentes = db.get("SELECT COUNT(*) as total FROM propostas WHERE status = 'pendente'").total;
    const aprovadas = db.get("SELECT COUNT(*) as total FROM propostas WHERE status = 'aprovado'").total;
    const rejeitadas = db.get("SELECT COUNT(*) as total FROM propostas WHERE status = 'rejeitado'").total;
    const totalClientes = db.get('SELECT COUNT(*) as total FROM clientes').total;
    const valorTotal = db.get("SELECT COALESCE(SUM(valor), 0) as total FROM propostas WHERE status = 'aprovado'").total;
    const propostasHoje = db.get("SELECT COUNT(*) as total FROM propostas WHERE DATE(created_at) = ?", [hoje]).total;
    const propostasMes = db.get("SELECT COUNT(*) as total FROM propostas WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").total;

    const ultimas = db.all(`
      SELECT p.*, c.nome as cliente_nome,
        (SELECT cob.status FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_status
      FROM propostas p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.created_at DESC LIMIT 5
    `);

    res.json({ stats: { totalPropostas, pendentes, aprovadas, rejeitadas, totalClientes, valorTotal, propostasHoje, propostasMes }, ultimas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
