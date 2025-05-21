const MedicamentoUsuario = require('../models/MedicamentoUsuario'); // Importa o modelo MedicamentoUsuario
const Medicamento = require('../models/Medicamento'); // Adicione no topo do arquivo

const MedicamentoController = {
    // Função para cadastrar um medicamento no modelo MedicamentoUsuario
    async cadastrarMedicamentoUsuario(req, res = null, session = null) {
        try {
            const { usuarioId, medicamentoId, inicio, dosagem, periodicidade, usoContinuo, consultaId } = req.body;

            // Validação básica para periodicidade
            if (!periodicidade || !periodicidade.tipo) {
                if (res) {
                    return res.status(400).json({ message: 'O campo periodicidade é obrigatório e deve conter o tipo.' });
                }
                throw new Error('O campo periodicidade é obrigatório e deve conter o tipo.');
            }

            const medicamento = await Medicamento.findById(medicamentoId);
            
            if (!medicamento) {
                if (res) {
                    return res.status(404).json({ message: 'Medicamento não encontrado.' });
                }
                throw new Error('Medicamento não encontrado.');
            }

            // Cria o registro no modelo MedicamentoUsuario
            const novoMedicamentoUsuario = new MedicamentoUsuario({
                usuarioId,
                medicamentoId,
                inicio,
                dosagem,
                periodicidade,
                usoContinuo,
                consultaId: consultaId || null // Consulta é opcional
            });

            // Salva o medicamento, com ou sem sessão
            let medicamentoUsuarioSalvo;
            if (session && typeof session === 'object' && typeof session.inTransaction === 'function') {
                medicamentoUsuarioSalvo = await novoMedicamentoUsuario.save({ session });
            } else {
                medicamentoUsuarioSalvo = await novoMedicamentoUsuario.save();
            }

            // Se `res` foi passado, retorna a resposta HTTP
            if (res) {
                return res.status(201).json(medicamentoUsuarioSalvo); // Certifique-se de retornar o objeto salvo
            }

            // Caso contrário, retorna o objeto salvo (para uso interno)
            return medicamentoUsuarioSalvo;
        } catch (error) {
            console.error('Erro ao cadastrar medicamento para o usuário:', error);

            // Se `res` foi passado, retorna o erro como resposta HTTP
            if (res) {
                return res.status(500).json({ message: 'Erro interno no servidor.' });
            }

            // Caso contrário, lança o erro para ser tratado pelo chamador
            throw error;
        }
    },

    // Função para listar todos os medicamentos
    async listarMedicamentosUsuario(req, res) {
        try {
            const medicamentos = await MedicamentoUsuario.find();
            res.status(200).json(medicamentos);
        } catch (error) {
            console.error('Erro ao listar medicamentos:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para buscar um medicamento por ID
    async buscarMedicamentoPorId(req, res) {
        try {
            const { id } = req.params;

            const medicamento = await MedicamentoUsuario.findById(id);
            if (!medicamento) {
                return res.status(404).json({ message: 'Medicamento não encontrado.' });
            }

            res.status(200).json(medicamento);
        } catch (error) {
            console.error('Erro ao buscar medicamento por ID:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para excluir um medicamento
    async excluirMedicamentoUsuario(req, res) {
        try {
            const { id } = req.params;

            const medicamentoExcluido = await MedicamentoUsuario.findByIdAndDelete(id);
            if (!medicamentoExcluido) {
                return res.status(404).json({ message: 'Medicamento não encontrado.' });
            }

            res.status(200).json({ message: 'Medicamento excluído com sucesso.' });
        } catch (error) {
            console.error('Erro ao excluir medicamento:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para buscar medicamento por ID da consulta
    async getMedicamentosByConsultaId(req, res) {
        try {
            // Busca os medicamentos associados à consulta
            const medicamentosUsuario = await MedicamentoUsuario.find({ consultaId: req.params.consultaId });
    
            if (!medicamentosUsuario || medicamentosUsuario.length === 0) {
                return res.status(404).json({ message: 'Nenhum medicamento encontrado para esta consulta.' });
            }
    
            // Busca os detalhes de cada medicamento
            const medicamentosDetalhados = await Promise.all(
                medicamentosUsuario.map(async (medicamentoUsuario) => {
                    const medicamento = await Medicamento.findById(medicamentoUsuario.medicamentoId);
                    return {
                        ...medicamentoUsuario.toObject(),
                        medicamentoDetalhes: medicamento || null, // Inclui os detalhes do medicamento ou null se não encontrado
                    };
                })
            );
    
            res.status(200).json(medicamentosDetalhados);
        } catch (error) {
            console.error('Erro ao buscar medicamentos:', error);
            res.status(500).json({ message: 'Erro ao buscar medicamentos.' });
        }
    },
};

module.exports = MedicamentoController;
