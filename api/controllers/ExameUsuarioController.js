const ExameUsuario = require('../models/ExameUsuario'); // Importa o modelo ExameUsuario
const Exame = require('../models/Exame'); // Importa o modelo Exame

const ExameUsuarioController = {
    // Função para cadastrar um exame no modelo ExameUsuario
    async cadastrarExameUsuario(req, res) {
        try {
            const { usuarioId, exameId, dataRealizacao, resultado, consultaId } = req.body;

            // Verifica se o exame existe
            const exame = await Exame.findById(exameId);
            if (!exame) {
                return res.status(404).json({ message: 'Exame não encontrado.' });
            }

            // Cria o registro no modelo ExameUsuario
            const novoExameUsuario = new ExameUsuario({
                usuarioId,
                exameId,
                dataRealizacao,
                resultado,
                consultaId: consultaId || null // Consulta é opcional
            });

            const exameUsuarioSalvo = await novoExameUsuario.save();
            res.status(201).json(exameUsuarioSalvo);
        } catch (error) {
            console.error('Erro ao cadastrar exame para o usuário:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para listar todos os exames de usuários
    async listarExamesUsuarios(req, res) {
        try {
            const examesUsuarios = await ExameUsuario.find().populate('exameId'); // Popula os dados do exame
            res.status(200).json(examesUsuarios);
        } catch (error) {
            console.error('Erro ao listar exames de usuários:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para buscar um exame de usuário por ID
    async buscarExameUsuarioPorId(req, res) {
        try {
            const { id } = req.params;

            const exameUsuario = await ExameUsuario.findById(id).populate('exameId'); // Popula os dados do exame
            if (!exameUsuario) {
                return res.status(404).json({ message: 'Exame do usuário não encontrado.' });
            }

            res.status(200).json(exameUsuario);
        } catch (error) {
            console.error('Erro ao buscar exame do usuário por ID:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para atualizar um exame de usuário
    async atualizarExameUsuario(req, res) {
        try {
            const { id } = req.params;
            const { dataRealizacao, resultado } = req.body;

            const exameUsuarioAtualizado = await ExameUsuario.findByIdAndUpdate(
                id,
                { dataRealizacao, resultado },
                { new: true } // Retorna o documento atualizado
            );

            if (!exameUsuarioAtualizado) {
                return res.status(404).json({ message: 'Exame do usuário não encontrado.' });
            }

            res.status(200).json(exameUsuarioAtualizado);
        } catch (error) {
            console.error('Erro ao atualizar exame do usuário:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para excluir um exame de usuário
    async excluirExameUsuario(req, res) {
        try {
            const { id } = req.params;

            const exameUsuarioExcluido = await ExameUsuario.findByIdAndDelete(id);
            if (!exameUsuarioExcluido) {
                return res.status(404).json({ message: 'Exame do usuário não encontrado.' });
            }

            res.status(200).json({ message: 'Exame do usuário excluído com sucesso.' });
        } catch (error) {
            console.error('Erro ao excluir exame do usuário:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    }
};

module.exports = ExameUsuarioController;