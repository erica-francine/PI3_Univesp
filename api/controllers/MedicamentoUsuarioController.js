const MedicamentoUsuario = require('../models/MedicamentoUsuario'); // Importa o modelo MedicamentoUsuario

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
            const medicamentoUsuarioSalvo = await novoMedicamentoUsuario.save(session ? { session } : {});

            // Se `res` foi passado, retorna a resposta HTTP
            if (res) {
                return res.status(201).json(medicamentoUsuarioSalvo);
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

            const medicamento = await Medicamento.findById(id);
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

    
};

module.exports = MedicamentoController;