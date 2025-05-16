const mongoose = require('mongoose');
const ConsultaUsuario = require('../models/ConsultaUsuario');
const ExameUsuarioController = require('./ExameUsuarioController');
const MedicamentoUsuarioController = require('./MedicamentoUsuarioController');
const CidUsuarioController = require('./CidUsuarioController');
const MedicamentoUsuario = require('../models/MedicamentoUsuario');
const ExameUsuario = require('../models/ExameUsuario');
const CidUsuario = require('../models/CidUsuario');

const ConsultasUsuarioController = {
    // Função para listar todas as consultas
    async listarConsultas(req, res) {
        try {
            const consultas = await ConsultaUsuario.find()
                .populate({
                    path: 'medicamentos.medicamentoUsuarioId',
                    populate: {
                        path: 'medicamentoId', // campo do MedicamentoUsuario que referencia Medicamento
                        model: 'Medicamento'
                    }
                })
                .populate({
                    path: 'exames.exameUsuarioId',
                    populate: {
                        path: 'exameId',
                        model: 'Exame'
                    }
                })
                .populate({
                    path: 'cid10.cidUsuarioId',
                    populate: {
                        path: 'cid10Id',
                        model: 'Cid10'
                    }
                }); // Popula os CIDs

            res.status(200).json(consultas);
        } catch (error) {
            console.error('Erro ao listar consultas:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para cadastrar uma consulta
    async cadastrarConsulta(req, res) {
        const session = await mongoose.startSession(); // Inicia uma sessão para a transação
        session.startTransaction(); // Inicia a transação

        try {
            const { usuarioId, dataConsulta, descricao, medicamentos, exames, cid10 } = req.body;

            // 1. Cadastrar medicamentos
            const medicamentosCadastrados = await Promise.all(
                (medicamentos || []).map(async (medicamento) => {
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
                    const resMedicamento = await MedicamentoUsuarioController.cadastrarMedicamentoUsuario(reqMedicamento, null, session);
                    return resMedicamento._id; // Retorna o ID do medicamento cadastrado
                })
            );

            // 2. Cadastrar exames
            const examesCadastrados = await Promise.all(
                (exames || []).map(async (exame) => {
                    const reqExame = {
                        body: {
                            usuarioId,
                            exameId: exame.exameId,
                            data: exame.data,
                            resultado: exame.resultado
                        }
                    };
                    const resExame = await ExameUsuarioController.cadastrarExameUsuario(reqExame, null, session);
                    return resExame._id; // Retorna o ID do exame cadastrado
                })
            );

            // 3. Cadastrar CIDs
            const cidsCadastrados = await Promise.all(
                (cid10 || []).map(async (cid) => {
                    const reqCid = {
                        body: {
                            usuarioId,
                            cid10Id: cid.cid10Id,
                            dataDiagnostico: cid.dataDiagnostico,
                            dataFinalizacao: cid.dataFinalizacao,
                        }
                    };
                    const resCid = await CidUsuarioController.cadastrarCidUsuario(reqCid, null, session);
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

            const consultaSalva = await novaConsulta.save({ session }); // Salva a consulta dentro da transação

            // 5. Atualizar medicamentos com o ID da consulta
            await Promise.all(
                medicamentosCadastrados.map(async (id) => {
                    await MedicamentoUsuario.findByIdAndUpdate(
                        id,
                        { consultaId: consultaSalva._id },
                        { session }
                    );
                })
            );

            // 6. Atualizar exames com o ID da consulta
            await Promise.all(
                examesCadastrados.map(async (id) => {
                    await ExameUsuario.findByIdAndUpdate(
                        id,
                        { consultaId: consultaSalva._id },
                        { session }
                    );
                })
            );

            // 7. Atualizar CIDs com o ID da consulta
            await Promise.all(
                cidsCadastrados.map(async (id) => {
                    await CidUsuario.findByIdAndUpdate(
                        id,
                        { consultaId: consultaSalva._id },
                        { session }
                    );
                })
            );

            // Confirma a transação
            await session.commitTransaction();
            session.endSession();

            res.status(201).json(consultaSalva);
        } catch (error) {
            // Reverte a transação em caso de erro
            await session.abortTransaction();
            session.endSession();
            console.error('Erro ao cadastrar consulta:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Função para excluir uma consulta
    async excluirConsulta(req, res) {
        const session = await mongoose.startSession(); // Inicia uma sessão para a transação
        session.startTransaction(); // Inicia a transação

        try {
            const { id } = req.params;

            // 1. Verifica se a consulta existe
            const consulta = await ConsultaUsuario.findById(id).session(session);
            if (!consulta) {
                return res.status(404).json({ message: 'Consulta não encontrada.' });
            }

            // 2. Exclui os medicamentos associados
            await Promise.all(
                consulta.medicamentos.map(async (medicamento) => {
                    await MedicamentoUsuario.findByIdAndDelete(medicamento.medicamentoUsuarioId, { session });
                })
            );

            // 3. Exclui os exames associados
            await Promise.all(
                consulta.exames.map(async (exame) => {
                    await ExameUsuario.findByIdAndDelete(exame.exameUsuarioId, { session });
                })
            );

            // 4. Exclui os CIDs associados
            await Promise.all(
                consulta.cid10.map(async (cid) => {
                    await CidUsuario.findByIdAndDelete(cid.cidUsuarioId, { session });
                })
            );

            // 5. Exclui a consulta
            await ConsultaUsuario.findByIdAndDelete(id, { session });

            // Confirma a transação
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ message: 'Consulta e itens associados excluídos com sucesso.' });
        } catch (error) {
            // Reverte a transação em caso de erro
            await session.abortTransaction();
            session.endSession();
            console.error('Erro ao excluir consulta:', error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    }
};

module.exports = ConsultasUsuarioController;