const express = require('express');
const router = express.Router();
const Medicamento = require('../models/Medicamento');

// Buscar medicamentos por nome (autocomplete)
router.get('/', async (req, res) => {
  const s = req.query.s || '';
  try {
    const resultados = await Medicamento.find({
      nomeProduto: { $regex: s, $options: 'i' }
    }).limit(20);
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar medicamentos' });
  }
});

module.exports = router;
