require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'finanflex_secret',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@finanflex.com.br',
  adminPassword: process.env.ADMIN_PASSWORD || 'FinanFlex@2026',
  cpfApiUrl: process.env.CPF_API_URL || 'http://147.93.67.151:9502/document',
  pix: {
    key: process.env.PIX_QRCODE_KEY || 'placeholder_chave_pix',
    merchant: process.env.PIX_QRCODE_MERCHANT || 'FinanFlex',
    city: process.env.PIX_QRCODE_CITY || 'Sao Paulo',
  },
  veopag: {
    apiUrl: process.env.VEOPAG_API_URL || 'https://api.veopag.com.br/sandbox',
    apiKey: process.env.VEOPAG_API_KEY || '',
    accountId: process.env.VEOPAG_ACCOUNT_ID || ''
  },
  taxaSolicitacao: parseFloat(process.env.TAXA_SOLICITACAO || '29.90'),
};
