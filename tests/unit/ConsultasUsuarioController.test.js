const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const ConsultasUsuarioController = require('../../api/controllers/ConsultasUsuarioController');
const ConsultaUsuario = require('../../api/models/ConsultaUsuario');
const MedicamentoUsuario = require('../../api/models/MedicamentoUsuario');
const ExameUsuario = require('../../api/models/ExameUsuario');
const CidUsuario = require('../../api/models/CidUsuario');

jest.mock('../../api/models/ConsultaUsuario');
jest.mock('../../api/models/MedicamentoUsuario');
jest.mock('../../api/models/ExameUsuario');
jest.mock('../../api/models/CidUsuario');

// Mock das controllers filhas
const MedicamentoUsuarioController = require('../../api/controllers/MedicamentoUsuarioController');
const ExameUsuarioController = require('../../api/controllers/ExameUsuarioController');
const CidUsuarioController = require('../../api/controllers/CidUsuarioController');

MedicamentoUsuarioController.cadastrarMedicamentoUsuario = jest.fn();
ExameUsuarioController.cadastrarExameUsuario = jest.fn();
CidUsuarioController.cadastrarCidUsuario = jest.fn();

const app = express();
app.use(express.json());
app.get('/consultas', ConsultasUsuarioController.listarConsultas);
app.post('/consultas', ConsultasUsuarioController.cadastrarConsulta);
app.delete('/consultas/:id', ConsultasUsuarioController.excluirConsulta);

describe('ConsultasUsuarioController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /consultas', () => {
        it('deve listar todas as consultas', async () => {
            ConsultaUsuario.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([
                    { _id: 'consulta1', usuarioId: 'user1', dataConsulta: '2024-05-16', descricao: 'desc' }
                ])
            });

            // Ajuste para suportar await ConsultaUsuario.find().populate().populate()...
            ConsultaUsuario.find.mockImplementation(() => {
                const chain = {
                    populate: jest.fn().mockReturnThis(),
                    exec: jest.fn().mockResolvedValue([
                        { _id: 'consulta1', usuarioId: 'user1', dataConsulta: '2024-05-16', descricao: 'desc' }
                    ])
                };
                return chain;
            });

            const response = await request(app).get('/consultas');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /consultas', () => {
        it('deve cadastrar uma nova consulta', async () => {
            // Mock session
            const session = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);

            // Mock cadastro de itens relacionados
            MedicamentoUsuarioController.cadastrarMedicamentoUsuario.mockResolvedValue({ _id: 'med1' });
            ExameUsuarioController.cadastrarExameUsuario.mockResolvedValue({ _id: 'exa1' });
            CidUsuarioController.cadastrarCidUsuario.mockResolvedValue({ _id: 'cid1' });

            ConsultaUsuario.prototype.save = jest.fn().mockResolvedValue({
                _id: 'consulta1',
                usuarioId: 'user1',
                dataConsulta: '2024-05-16',
                descricao: 'desc',
                medicamentos: [{ medicamentoUsuarioId: 'med1' }],
                exames: [{ exameUsuarioId: 'exa1' }],
                cid10: [{ cidUsuarioId: 'cid1' }]
            });

            MedicamentoUsuario.findByIdAndUpdate.mockResolvedValue({});
            ExameUsuario.findByIdAndUpdate.mockResolvedValue({});
            CidUsuario.findByIdAndUpdate.mockResolvedValue({});

            const consultaPayload = {
                usuarioId: 'user1',
                dataConsulta: '2024-05-16',
                descricao: 'desc',
                medicamentos: [
                    {
                        medicamentoId: 'medid',
                        inicio: '2024-05-16',
                        dosagem: '10mg',
                        periodicidade: { tipo: 'Intervalo', unidadeIntervalo: 'Horas', valorIntervalo: 8 },
                        usoContinuo: false
                    }
                ],
                exames: [
                    {
                        exameId: 'exaid',
                        dataRealizacao: '2024-05-16',
                        resultado: 'Normal'
                    }
                ],
                cid10: [
                    {
                        cidId: 'cidid',
                        observacoes: 'Observação'
                    }
                ]
            };

            const response = await request(app).post('/consultas').send(consultaPayload);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
        });
    });

    describe('DELETE /consultas/:id', () => {
        it('deve excluir uma consulta e seus itens associados', async () => {
            // Mock session
            const session = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);

            const consulta = {
                _id: 'consulta1',
                medicamentos: [{ medicamentoUsuarioId: 'med1' }],
                exames: [{ exameUsuarioId: 'exa1' }],
                cid10: [{ cidUsuarioId: 'cid1' }]
            };
            ConsultaUsuario.findById.mockReturnValue({ session: () => consulta });

            MedicamentoUsuario.findByIdAndDelete.mockResolvedValue({});
            ExameUsuario.findByIdAndDelete.mockResolvedValue({});
            CidUsuario.findByIdAndDelete.mockResolvedValue({});
            ConsultaUsuario.findByIdAndDelete.mockResolvedValue({});

            const response = await request(app).delete('/consultas/consulta1');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
        });
    });
});
