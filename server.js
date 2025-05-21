require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { exec } = require('child_process');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const mainRouter = require('./api/routes/router');
const viewRouter = require('./api/routes/viewRouter');
const consultaUsuarioRoutes = require('./api/routes/consultaUsuario');
const MedicamentoUsuarioController = require('./api/controllers/MedicamentoUsuarioController');
const ExameUsuarioController = require('./api/controllers/ExameUsuarioController');
const CidUsuarioController = require('./api/controllers/CidUsuarioController');

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
    dbName: 'fichaMedica', // Nome do banco de dados
    maxPoolSize: 10
})
.then(() => console.log('Conectado ao MongoDB Atlas'))
.catch(err => console.error('Erro de conexão ao MongoDB Atlas:', err));

// Executar importações ao iniciar o servidor
/* exec('node ./api/importadores/importAll.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Erro ao executar importAll.js: ${error.message}`);
        return;
    }
    if (stderr) console.error(stderr);
    console.log(stdout);
}); */

// Rotas
app.use('/consultaUsuario', consultaUsuarioRoutes);
app.use('/medicamentos', require('./api/routes/medicamentos'));
app.use('/exames', require('./api/routes/exames'));
app.use('/cid10', require('./api/routes/cid10'));
app.use('/user', express.json(),require('./api/routes/userRouter')); // Usando userRouter para login, registro e logout
app.use('/fichaMedica', viewRouter);
app.use('/consultaUsuario', mainRouter); // Registra as rotas do arquivo router.js

// Rota para /header
app.get('/header', (req, res) => {
  res.sendFile(path.join(__dirname, './public/painel-ficha-medica/header.html'));
});

// Rota para /home
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, './public/painel-ficha-medica/consultas.html'));
});

// Rota para /cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, './public/painel-ficha-medica/cadastro.html'));
});

// Rota para /perfil
app.get('/perfil', (req, res) => {
  res.sendFile(path.join(__dirname, './public/painel-ficha-medica/perfil.html'));
});

app.get('/medicamentosUsuario/:consultaId', MedicamentoUsuarioController.getMedicamentosByConsultaId);
app.get('/examesUsuario/:consultaId', ExameUsuarioController.getExamesByConsultaId);
app.get('/cidsUsuario/:consultaId', CidUsuarioController.getCidByConsultaId);



// Rota para executar o importador
/* app.get('/importar', (req, res) => {
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
}); */

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
