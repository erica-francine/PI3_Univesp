const express = require('express');
const path = require('path'); // Importa o módulo path
const router = express.Router();

// Rota para renderizar o arquivo index.html
router.get('/', (req, res) => {
    const filePath = path.join(__dirname, '../../public/index.html'); // Caminho relativo ao arquivo
    res.sendFile(filePath); // Envia o arquivo index.html
});

module.exports = router;