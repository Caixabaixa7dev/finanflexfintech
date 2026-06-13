const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const getDb = require('../database/database');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const db = await getDb();
    const { cpf, pin } = req.body;

    if (!cpf || !pin) {
      return res.status(400).json({ error: 'CPF e PIN são obrigatórios' });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    const cliente = db.get('SELECT * FROM clientes WHERE cpf = ?', [cpfLimpo]);

    if (!cliente) {
      return res.status(401).json({ error: 'Cliente não encontrado' });
    }

    if (String(cliente.pin) !== String(pin)) {
      return res.status(401).json({ error: 'PIN inválido' });
    }

    const token = jwt.sign(
      { id: cliente.id, cpf: cliente.cpf, nome: cliente.nome },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      cliente: {
        id: cliente.id, nome: cliente.nome, cpf: cliente.cpf,
        email: cliente.email, celular: cliente.celular
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/propostas', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Token obrigatório' });

    const token = auth.split(' ')[1];
    let decoded;
    try { decoded = jwt.verify(token, config.jwtSecret); }
    catch { return res.status(401).json({ error: 'Token inválido' }); }

    const db = await getDb();
    const propostas = db.all(`
      SELECT p.*, c.nome as cliente_nome, c.cpf as cliente_cpf,
        (SELECT cob.status FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_status,
        (SELECT cob.qrcode FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_qrcode
      FROM propostas p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE c.cpf = ?
      ORDER BY p.created_at DESC
    `, [decoded.cpf]);

    res.json({ propostas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/proposta/:id', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Token obrigatório' });

    const token = auth.split(' ')[1];
    let decoded;
    try { decoded = jwt.verify(token, config.jwtSecret); }
    catch { return res.status(401).json({ error: 'Token inválido' }); }

    const db = await getDb();
    const proposta = db.get(`
      SELECT p.*, c.nome as cliente_nome, c.cpf as cliente_cpf, c.email, c.celular,
        (SELECT cob.status FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_status,
        (SELECT cob.qrcode FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_qrcode,
        (SELECT cob.valor FROM cobrancas cob WHERE cob.proposta_id = p.id ORDER BY cob.id DESC LIMIT 1) as cobranca_valor
      FROM propostas p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ? AND c.cpf = ?
    `, [req.params.id, decoded.cpf]);

    if (!proposta) return res.status(404).json({ error: 'Proposta não encontrada' });
    res.json({ proposta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
