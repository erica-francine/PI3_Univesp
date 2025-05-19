const express = require('express');
const MedicamentoUsuarioController = require('../controllers/MedicamentoUsuarioController');
const ExameUsuarioController = require('../controllers/ExameUsuarioController');
const CidUsuarioController = require('../controllers/CidUsuarioController');
const ConsultasUsuarioController = require('../controllers/ConsultasUsuarioController');

const router = express.Router();

// Rotas para MedicamentoUsuario
router.get('/medicamentosUsuario', MedicamentoUsuarioController.listarMedicamentosUsuario);
router.post('/medicamentosUsuario', MedicamentoUsuarioController.cadastrarMedicamentoUsuario);
router.delete('/medicamentosUsuario/:id', MedicamentoUsuarioController.excluirMedicamentoUsuario);
router.get('/medicamentosUsuario/:consultaId', MedicamentoUsuarioController.getMedicamentosByConsultaId);

// Rotas para ExameUsuario
router.get('/examesUsuario', ExameUsuarioController.listarExamesUsuarios);
router.post('/examesUsuario', ExameUsuarioController.cadastrarExameUsuario);
router.delete('/examesUsuario/:id', ExameUsuarioController.excluirExameUsuario);
router.get('/examesUsuario/:consultaId', ExameUsuarioController.getExamesByConsultaId);

// Rotas para CidUsuario
router.get('/cidsUsuario', CidUsuarioController.listarCidsUsuarios);
router.post('/cidsUsuario', CidUsuarioController.cadastrarCidUsuario);
router.delete('/cidsUsuario/:id', CidUsuarioController.excluirCidUsuario);
router.get('/cidsUsuario/:consultaId', CidUsuarioController.getCidByConsultaId);

// Rotas para ConsultaUsuario
router.get('/consultasUsuario', ConsultasUsuarioController.listarConsultas);
router.post('/consultasUsuario', ConsultasUsuarioController.cadastrarConsulta);
router.delete('/consultasUsuario/:id', ConsultasUsuarioController.excluirConsulta);

module.exports = router;
