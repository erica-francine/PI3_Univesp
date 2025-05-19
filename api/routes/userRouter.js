const express = require('express');
const router = express.Router();
const userController = require('../controllers/AuthController'); // Usando AuthController para login, registro e logout
const authMiddleware = require('../controllers/AuthController').authMiddleware; // Middleware de autenticação

// Rotas públicas
router.post('/register', userController.register); // Registro de usuário
router.post('/login', userController.login); // Login de usuário
router.post('/logout', userController.logout); // Logout de usuário


module.exports = router;