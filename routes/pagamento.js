const express = require('express');
const crypto = require('crypto');
const config = require('../config/config');
const getDb = require('../database/database');

const router = express.Router();

function gerarQRCodePix(valor) {
  const txid = crypto.randomBytes(12).toString('hex').toUpperCase().substring(0, 25);
  const merchant = config.pix.merchant;
  const key = config.pix.key;
  const city = config.pix.city;
  const valorStr = valor.toFixed(2);

  const payload = [
    '000201', '010212',
    '26360014BR.GOV.BCB.PIX0144' + key + '0204' + txid.substring(0, 4),
    '52040000', '5303986',
    '54' + valorStr.length.toString().padStart(2, '0') + valorStr,
    '5802BR',
    '59' + merchant.length.toString().padStart(2, '0') + merchant,
    '60' + city.length.toString().padStart(2, '0') + city,
    '62070503***', '6304'
  ].join('');

  return { qrcode: payload, txid };
}

router.post('/gerar', async (req, res) => {
  try {
    const db = await getDb();
    const { proposta_id, valor } = req.body;

    if (!proposta_id || !valor) {
      return res.status(400).json({ error: 'proposta_id e valor obrigatórios' });
    }

    const proposta = db.get('SELECT * FROM propostas WHERE id = ?', [proposta_id]);
    if (!proposta) return res.status(404).json({ error: 'Proposta não encontrada' });

    const { qrcode, txid } = gerarQRCodePix(valor);

    db.run('INSERT INTO cobrancas (proposta_id, valor, qrcode, qrcode_txid, status) VALUES (?, ?, ?, ?, ?)',
      [proposta_id, valor, qrcode, txid, 'pendente']);

    const cobranca = db.get('SELECT * FROM cobrancas WHERE id = ?', [db.lastInsertRowid]);

    res.status(201).json({ cobranca });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/status', async (req, res) => {
  try {
    const db = await getDb();
    const cobranca = db.get('SELECT * FROM cobrancas WHERE id = ?', [req.params.id]);
    if (!cobranca) return res.status(404).json({ error: 'Cobrança não encontrada' });
    res.json({ cobranca });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/confirmar', require('../middleware/auth'), async (req, res) => {
  try {
    const db = await getDb();
    const cobranca = db.get('SELECT * FROM cobrancas WHERE id = ?', [req.params.id]);
    if (!cobranca) return res.status(404).json({ error: 'Cobrança não encontrada' });

    db.run("UPDATE cobrancas SET status = 'pago' WHERE id = ?", [req.params.id]);
    db.run("UPDATE propostas SET status = 'em_analise', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cobranca.proposta_id]);

    const updated = db.get('SELECT * FROM cobrancas WHERE id = ?', [req.params.id]);
    res.json({ cobranca: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
