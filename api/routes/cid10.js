const express = require('express');
const router = express.Router();
const Cid10 = require('../models/Cid10');

// Buscar por CID10 ou Descricao (autocomplete)
router.get('/', async (req, res) => {
    const s = req.query.s || '';
    try {
      const resultados = await Cid10.find({
        $or: [
          { cid10: { $regex: s, $options: 'i' } },
          { descricao: { $regex: s, $options: 'i' } }
        ]
      }).limit(20);
      res.json(resultados);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao buscar CID' });
    }
});

module.exports = router;
