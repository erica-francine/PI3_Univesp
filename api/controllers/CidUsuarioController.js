const CidUsuario = require('../models/CidUsuario'); // Importa o modelo CidUsuario
const Cid10 = require('../models/Cid10'); // Importa o modelo Cid10

const CidUsuarioController = {
    // Função para cadastrar um diagnóstico no modelo CidUsuario
    async cadastrarCidUsuario(req, res) {
        try {
            const { usuarioId, cidId, observacoes, consultaId } = req.body;

            // Verifica se o CID-10 existe
            const cid = await Cid10.findById(cidId);
            if (!cid) {
                return res.status(404).json({ message: 'CID-10 não encontrado.' });
            }

            // Cria o registro no modelo CidUsuario
            const novoCidUsuario = new CidUsuario({
                usuarioId,
                cidId,
                observacoes,
                consultaId: consultaId || null // Consulta é opcional
            });

            const cidUsuarioSalvo = await novoCidUsuario.save();
            res.status(201).json(cidUsuarioSalvo);
        } catch (error) {
            console.error('Erro ao cadastrar CID para o usuário:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para listar todos os diagnósticos de usuários
    async listarCidsUsuarios(req, res) {
        try {
            const cidsUsuarios = await CidUsuario.find().populate('cidId'); // Popula os dados do CID-10
            res.status(200).json(cidsUsuarios);
        } catch (error) {
            console.error('Erro ao listar CIDs de usuários:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para buscar um diagnóstico de usuário por ID
    async buscarCidUsuarioPorId(req, res) {
        try {
            const { id } = req.params;

            const cidUsuario = await CidUsuario.findById(id).populate('cidId'); // Popula os dados do CID-10
            if (!cidUsuario) {
                return res.status(404).json({ message: 'CID do usuário não encontrado.' });
            }

            res.status(200).json(cidUsuario);
        } catch (error) {
            console.error('Erro ao buscar CID do usuário por ID:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para atualizar um diagnóstico de usuário
    async atualizarCidUsuario(req, res) {
        try {
            const { id } = req.params;
            const { observacoes } = req.body;

            const cidUsuarioAtualizado = await CidUsuario.findByIdAndUpdate(
                id,
                { observacoes },
                { new: true } // Retorna o documento atualizado
            );

            if (!cidUsuarioAtualizado) {
                return res.status(404).json({ message: 'CID do usuário não encontrado.' });
            }

            res.status(200).json(cidUsuarioAtualizado);
        } catch (error) {
            console.error('Erro ao atualizar CID do usuário:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para excluir um diagnóstico de usuário
    async excluirCidUsuario(req, res) {
        try {
            const { id } = req.params;

            const cidUsuarioExcluido = await CidUsuario.findByIdAndDelete(id);
            if (!cidUsuarioExcluido) {
                return res.status(404).json({ message: 'CID do usuário não encontrado.' });
            }

            res.status(200).json({ message: 'CID do usuário excluído com sucesso.' });
        } catch (error) {
            console.error('Erro ao excluir CID do usuário:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    }
};

module.exports = CidUsuarioController;