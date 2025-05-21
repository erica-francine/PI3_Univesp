const CidUsuario = require('../models/CidUsuario'); // Importa o modelo CidUsuario
const Cid10 = require('../models/Cid10'); // Importa o modelo Cid10

const CidUsuarioController = {
    // Função para cadastrar um diagnóstico no modelo CidUsuario
    async cadastrarCidUsuario(req, res = null, session = null) {
        try {
            const { usuarioId, cid10Id, dataDiagnostico, dataFinalizacao, consultaId, status } = req.body;

            // Verifica se o CID-10 existe
            const cid = await Cid10.findById(cid10Id);
            if (!cid) {
                if (res) {
                    return res.status(404).json({ message: 'CID-10 não encontrado.' });
                }
                throw new Error('CID-10 não encontrado.');
            }

            // Cria o registro no modelo CidUsuario
            const novoCidUsuario = new CidUsuario({
                usuarioId,
                cid10Id,
                dataDiagnostico,
                dataFinalizacao,
                consultaId: consultaId || null,
                status: status || 'ativo'
            });

            // Salva o CID, com ou sem sessão
            let cidUsuarioSalvo;
            if (session && typeof session === 'object' && typeof session.inTransaction === 'function') {
                cidUsuarioSalvo = await novoCidUsuario.save({ session });
            } else {
                cidUsuarioSalvo = await novoCidUsuario.save();
            }
                    
            // Se `res` foi passado, retorna a resposta HTTP
            if (res) {
                return res.status(201).json(cidUsuarioSalvo);
            }

            // Caso contrário, retorna o objeto salvo (para uso interno)
            return cidUsuarioSalvo;
        } catch (error) {
            console.error('Erro ao cadastrar CID para o usuário:', error);

            // Se `res` foi passado, retorna o erro como resposta HTTP
            if (res) {
                return res.status(500).json({ message: 'Erro interno no servidor.' });
            }

            // Caso contrário, lança o erro para ser tratado pelo chamador
            throw error;
        }
    },

    // Função para listar todos os diagnósticos de usuários
    async listarCidsUsuarios(req, res) {
        try {
            const cidsUsuarios = await CidUsuario.find().populate('cid10Id'); // Popula os dados do CID-10
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

            const cidUsuario = await CidUsuario.findById(id).populate('cid10Id'); // Popula os dados do CID-10
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
            const {
                usuarioId,
                cid10Id,
                dataDiagnostico,
                dataFinalizacao,
                consultaId,
                status
            } = req.body;

            const cidUsuarioAtualizado = await CidUsuario.findByIdAndUpdate(
                id,
                {
                    usuarioId,
                    cid10Id,
                    dataDiagnostico,
                    dataFinalizacao,
                    consultaId,
                    status
                },
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
    },

    // Função para buscar CID-10 por ID da consulta
    async getCidByConsultaId(req, res) {
        try {
            // Busca os cid10 associados à consulta
            const cid10Usuario = await CidUsuario.find({ consultaId: req.params.consultaId });
    
            if (!cid10Usuario || cid10Usuario.length === 0) {
                return res.status(404).json({ message: 'Nenhum CID-10 encontrado para esta consulta.' });
            }
    
            // Busca os detalhes de cada cid10
            const cid10Detalhados = await Promise.all(
                cid10Usuario.map(async (cid10Usuario) => {
                    const cid10 = await Cid10.findById(cid10Usuario.cid10Id);
                    return {
                        ...cid10Usuario.toObject(),
                        cid10Detalhes: cid10 || null, // Inclui os detalhes do cid10 ou null se não encontrado
                    };
                })
            );
    
            res.status(200).json(cid10Detalhados);
        } catch (error) {
            console.error('Erro ao buscar CID-10:', error);
            res.status(500).json({ message: 'Erro ao buscar CID-10.' });
        }
    },
};

module.exports = CidUsuarioController;
