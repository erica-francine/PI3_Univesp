const MedicamentoUsuario = require('../models/MedicamentoUsuario'); // Importa o modelo MedicamentoUsuario

const MedicamentoController = {
    // Função para cadastrar um medicamento no modelo MedicamentoUsuario
    async cadastrarMedicamentoUsuario(req, res) {
        try {
            const { usuarioId, medicamentoId, inicio, dosagem, periodicidade, usoContinuo, consultaId } = req.body;

            // Validação básica para periodicidade
            if (!periodicidade || !periodicidade.tipo) {
                return res.status(400).json({ message: 'O campo periodicidade é obrigatório e deve conter o tipo.' });
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

            const medicamentoUsuarioSalvo = await novoMedicamentoUsuario.save();
            res.status(201).json(medicamentoUsuarioSalvo);
        } catch (error) {
            console.error('Erro ao cadastrar medicamento para o usuário:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para listar todos os medicamentos
    async listarMedicamentos(req, res) {
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
    async excluirMedicamento(req, res) {
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