const ExameUsuario = require('../models/ExameUsuario'); // Importa o modelo ExameUsuario
const Exame = require('../models/Exame'); // Importa o modelo Exame

const ExameUsuarioController = {
    // Função para cadastrar um exame no modelo ExameUsuario
    async cadastrarExameUsuario(req, res = null, session = null) {
        try {
            const { usuarioId, exameId, data, resultado, consultaId } = req.body;

            // Verifica se o exame existe
            const exame = await Exame.findById(exameId);
            if (!exame) {
                if (res) {
                    return res.status(404).json({ message: 'Exame não encontrado.' });
                }
                throw new Error('Exame não encontrado.');
            }

            // Cria o registro no modelo ExameUsuario
            const novoExameUsuario = new ExameUsuario({
                usuarioId,
                exameId,
                data,
                resultado,
                consultaId: consultaId || null // Consulta é opcional
            });

            // Salva o exame, com ou sem sessão
            let exameUsuarioSalvo;
            if (session && typeof session === 'object' && typeof session.inTransaction === 'function') {
                exameUsuarioSalvo = await novoExameUsuario.save({ session });
            } else {
                exameUsuarioSalvo = await novoExameUsuario.save();
            }

            // Se `res` foi passado, retorna a resposta HTTP
            if (res) {
                return res.status(201).json(exameUsuarioSalvo);
            }

            // Caso contrário, retorna o objeto salvo (para uso interno)
            return exameUsuarioSalvo;
        } catch (error) {
            console.error('Erro ao cadastrar exame para o usuário:', error);

            // Se `res` foi passado, retorna o erro como resposta HTTP
            if (res) {
                return res.status(500).json({ message: 'Erro interno no servidor.' });
            }

            // Caso contrário, lança o erro para ser tratado pelo chamador
            throw error;
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
            const { data, resultado } = req.body;

            const exameUsuarioAtualizado = await ExameUsuario.findByIdAndUpdate(
                id,
                { data, resultado },
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