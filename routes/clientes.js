const express = require('express');
const getDb = require('../database/database');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { nome, cpf, email, telefone, celular, data_nascimento, sexo, nome_mae, renda, cep, endereco, bairro, cidade, estado, score, pin } = req.body;

    if (!nome || !cpf) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    const existente = db.get('SELECT * FROM clientes WHERE cpf = ?', [cpfLimpo]);
    if (existente) {
      return res.status(200).json({ cliente: existente, message: 'Cliente já cadastrado' });
    }

    db.run(`
      INSERT INTO clientes (nome, cpf, email, telefone, celular, data_nascimento, sexo, nome_mae, renda, cep, endereco, bairro, cidade, estado, score, pin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [nome, cpfLimpo, email || '', telefone || '', celular || '', data_nascimento || '', sexo || '', nome_mae || '', renda || 0, cep || '', endereco || '', bairro || '', cidade || '', estado || '', score || 0, pin || '']);

    const id = db.lastInsertRowid;
    const cliente = db.get('SELECT * FROM clientes WHERE id = ?', [id]);
    res.status(201).json({ cliente });
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
    const search = req.query.search || '';

    let query = 'SELECT * FROM clientes';
    let countQuery = 'SELECT COUNT(*) as total FROM clientes';
    const params = [];

    if (search) {
      query += ' WHERE nome LIKE ? OR cpf LIKE ? OR email LIKE ?';
      countQuery += ' WHERE nome LIKE ? OR cpf LIKE ? OR email LIKE ?';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const clientes = db.all(query, params);
    const countParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    const { total } = db.get(countQuery, countParams);

    res.json({ clientes, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const cliente = db.get('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ cliente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
