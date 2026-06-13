const express = require('express');
const getDb = require('../database/database');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', auth, async (req, res) => {
  try {
    const db = await getDb();

    const totalPropostas = db.get('SELECT COUNT(*) as total FROM propostas').total;
    const pendentes = db.get("SELECT COUNT(*) as total FROM propostas WHERE status = 'pendente'").total;
    const aprovadas = db.get("SELECT COUNT(*) as total FROM propostas WHERE status = 'aprovado'").total;
    const rejeitadas = db.get("SELECT COUNT(*) as total FROM propostas WHERE status = 'rejeitado'").total;
    const totalClientes = db.get('SELECT COUNT(*) as total FROM clientes').total;
    const valorTotalAprovado = db.get("SELECT COALESCE(SUM(valor), 0) as total FROM propostas WHERE status = 'aprovado'").total;
    const valorTotalPendente = db.get("SELECT COALESCE(SUM(valor), 0) as total FROM propostas WHERE status = 'pendente'").total;

    const hoje = new Date().toISOString().split('T')[0];
    const propostasHoje = db.get("SELECT COUNT(*) as total FROM propostas WHERE DATE(created_at) = ?", [hoje]).total;
    const propostasMes = db.get("SELECT COUNT(*) as total FROM propostas WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").total;

    const propostasPorStatus = db.all("SELECT status, COUNT(*) as total FROM propostas GROUP BY status");

    const propostasPorDia = db.all(`
      SELECT DATE(created_at) as dia, COUNT(*) as total
      FROM propostas
      WHERE DATE(created_at) >= DATE('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY dia
    `);

    const ultimasPropostas = db.all(`
      SELECT p.*, c.nome as cliente_nome, c.cpf as cliente_cpf
      FROM propostas p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.created_at DESC LIMIT 10
    `);

    res.json({
      totalPropostas, pendentes, aprovadas, rejeitadas,
      totalClientes, valorTotalAprovado, valorTotalPendente,
      propostasHoje, propostasMes,
      propostasPorStatus, propostasPorDia,
      ultimasPropostas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
