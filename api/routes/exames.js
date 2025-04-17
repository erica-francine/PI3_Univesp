const express = require('express');
const router = express.Router();
const Exame = require('../models/Exame');

// Buscar exames por nome (autocomplete)
router.get('/', async (req, res) => {
  const s = req.query.s || '';
  try {
    const resultados = await Exame.find({
      nome: { $regex: s, $options: 'i' }
    }).limit(20);
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar exames' });
  }
});

module.exports = router;
