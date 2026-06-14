const express = require('express');
const axios = require('axios');
const config = require('../config/config');
const getDb = require('../database/database');

const router = express.Router();

// Função para gerar QR Code Pix via Veopag
async function gerarQRCodeVeopag(valor, txid) {
  try {
    const response = await axios.post(
      `${config.veopag.apiUrl}/cobranca/pix`,
      {
        valor: valor.toFixed(2),
        txid: txid || Math.random().toString(36).substring(2, 25), // TXID opcional
        contaId: config.veopag.accountId
      },
      {
        headers: {
          'Authorization': `Bearer ${config.veopag.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Assumindo que a API Veopag retorna esses campos (ajustar conforme documentação real)
    return {
      qrcode: response.data.qrCode || response.data.payload || '', // Código QR em formato texto
      qrcodeBase64: response.data.qrCodeBase64 || null, // Se disponível
      txid: response.data.txid || '',
      copiaECola: response.data.copiaECola || response.data.code || '' // Código para copia e cola
    };
  } catch (error) {
    console.error('Erro Veopag:', error.response?.data?.message || error.message);
    throw new Error(`Erro ao gerar QR Code Pix: ${error.response?.data?.message || error.message}`);
  }
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

    // Gerar QR Code via Veopag
    const { qrcode, qrcodeBase64, txid, copiaECola } = await gerarQRCodeVeopag(valor);

    db.run('INSERT INTO cobrancas (proposta_id, valor, qrcode, qrcode_txid, copia_e_cola, status) VALUES (?, ?, ?, ?, ?, ?)',
      [proposta_id, valor, qrcode, txid, copiaECola, 'pendente']);

    const cobranca = db.get('SELECT * FROM cobrancas WHERE id = ?', [db.lastInsertRowid]);

    res.status(201).json({ 
      cobranca,
      qrcodeBase64 // Para exibição imediata no frontend se necessário
    });
  } catch (err) {
    console.error('Erro Veopag:', err);
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
