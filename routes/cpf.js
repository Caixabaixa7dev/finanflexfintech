const express = require('express');
const config = require('../config/config');

const router = express.Router();

router.post('/', async (req, res) => {
  const { cpf } = req.body;
  if (!cpf) return res.status(400).json({ error: 'CPF é obrigatório' });

  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return res.status(400).json({ error: 'CPF inválido' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${config.cpfApiUrl}/${cpfLimpo}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(404).json({ error: 'CPF não encontrado na base' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Erro consulta CPF:', err.message);
    res.status(502).json({ error: 'Erro ao consultar CPF, tente novamente' });
  }
});

module.exports = router;
