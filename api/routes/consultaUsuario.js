const express = require('express');
const router = express.Router();
const ConsultaUsuario = require('../models/ConsultaUsuario'); // Modelo de consultas
const ConsultasUsuarioController = require('../controllers/ConsultasUsuarioController'); // Controlador de consultas

// Rota para buscar consultas de um usuário pelo ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Busca as consultas no banco de dados com base no ID do usuário
        const consultas = await ConsultaUsuario.find({ usuarioId: userId });

        // Retorna um array vazio se nenhuma consulta for encontrada
        if (!consultas || consultas.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(consultas);
    } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

router.post('/cadastrarConsulta', ConsultasUsuarioController.cadastrarConsulta);

// Rota para excluir uma consulta
router.delete('/:id', ConsultasUsuarioController.excluirConsulta);

// Rota para atualizar uma consulta
router.put('/:id', ConsultasUsuarioController.atualizarConsulta);

module.exports = router;
