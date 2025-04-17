require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(process.env.MONGO_URI, {
    /* useNewUrlParser: true, */
    /* useUnifiedTopology: true, */
    dbName: 'fichaMedica' 
  })
  .then(() => console.log('Conectado ao MongoDB'))
//   .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => console.error('Erro de conexão:', err));

// Executar importações ao iniciar o servidor
exec('node ./api/importadores/importAll.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Erro ao executar importAll.js: ${error.message}`);
        return;
    }
    if (stderr) console.error(stderr);
    console.log(stdout);
});

// Rotas
app.use('/medicamentos', require('./api/routes/medicamentos'));
app.use('/exames', require('./api/routes/exames'));
app.use('/cid10', require('./api/routes/cid10'));

// Rota para executar o importador
app.get('/importar', (req, res) => {
    console.log('Iniciando importações');
    console.log('Iniciando importações');
    console.log('Iniciando importações');
    console.log('Iniciando importações');
    console.log('Iniciando importações');
    console.log('Iniciando importações');
    console.log('Iniciando importações');
    exec('node ./api/importadores/importAll.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao executar importAll.js: ${error.message}`);
            return res.status(500).send('Erro ao executar importação.');
        }
        if (stderr) console.error(stderr);
        console.log(stdout);
        res.send('Importação concluída com sucesso!');
    });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
