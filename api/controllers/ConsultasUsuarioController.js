const ConsultaUsuario = require('../models/ConsultaUsuario');
const ExameUsuarioController = require('./ExameUsuarioController');
const MedicamentoUsuarioController = require('./MedicamentoUsuarioController');
const CidUsuarioController = require('./CidUsuarioController');

const ConsultasUsuarioController = {
    async cadastrarConsulta(req, res) {
        try {
            const { usuarioId, dataConsulta, descricao, medicamentos, exames, cid10 } = req.body;

            // 1. Cadastrar medicamentos
            const medicamentosCadastrados = await Promise.all(
                medicamentos.map(async (medicamento) => {
                    const reqMedicamento = {
                        body: {
                            usuarioId,
                            medicamentoId: medicamento.medicamentoId,
                            inicio: medicamento.inicio,
                            dosagem: medicamento.dosagem,
                            periodicidade: medicamento.periodicidade,
                            usoContinuo: medicamento.usoContinuo
                        }
                    };
                    const resMedicamento = await MedicamentoUsuarioController.cadastrarMedicamentoUsuario(reqMedicamento);
                    return resMedicamento._id; // Retorna o ID do medicamento cadastrado
                })
            );

            // 2. Cadastrar exames
            const examesCadastrados = await Promise.all(
                exames.map(async (exame) => {
                    const reqExame = {
                        body: {
                            usuarioId,
                            exameId: exame.exameId,
                            dataRealizacao: exame.dataRealizacao,
                            resultado: exame.resultado
                        }
                    };
                    const resExame = await ExameUsuarioController.cadastrarExameUsuario(reqExame);
                    return resExame._id; // Retorna o ID do exame cadastrado
                })
            );

            // 3. Cadastrar CIDs
            const cidsCadastrados = await Promise.all(
                cid10.map(async (cid) => {
                    const reqCid = {
                        body: {
                            usuarioId,
                            cidId: cid.cidId,
                            observacoes: cid.observacoes
                        }
                    };
                    const resCid = await CidUsuarioController.cadastrarCidUsuario(reqCid);
                    return resCid._id; // Retorna o ID do CID cadastrado
                })
            );

            // 4. Cadastrar a consulta
            const novaConsulta = new ConsultaUsuario({
                usuarioId,
                dataConsulta,
                descricao,
                medicamentos: medicamentosCadastrados.map((id) => ({ medicamentoUsuarioId: id })),
                exames: examesCadastrados.map((id) => ({ exameUsuarioId: id })),
                cid10: cidsCadastrados.map((id) => ({ cidUsuarioId: id }))
            });

            const consultaSalva = await novaConsulta.save();
            res.status(201).json(consultaSalva);
        } catch (error) {
            console.error('Erro ao cadastrar consulta:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    }
};

module.exports = ConsultasUsuarioController;