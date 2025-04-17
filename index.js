const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors()); // permite chamadas de outras origens
const PORT = 3000;

// Rota para buscar medicamentos
app.get('/medicamentos', async (req, res) => {
    const nome = req.query.nome;

    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

    try {
        const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(nome)}`;
        const response = await axios.get(url);
        
        const resultados = response.data.drugGroup?.conceptGroup || [];
        const medicamentos = [];

        resultados.forEach(grupo => {
            if (grupo.conceptProperties) {
                grupo.conceptProperties.forEach(item => {
                    medicamentos.push({
                        nome: item.name,
                        rxcui: item.rxcui
                    });
                });
            }
        });

        res.json(medicamentos);
    } catch (error) {
        console.error('Erro ao consultar a API RxNorm:', error);
        res.status(500).json({ error: 'Erro ao buscar medicamento' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
