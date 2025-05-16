const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const ExameUsuarioController = require('../../api/controllers/ExameUsuarioController');
const ExameUsuario = require('../../api/models/ExameUsuario');
const Exame = require('../../api/models/Exame');

jest.mock('../../api/models/ExameUsuario');
jest.mock('../../api/models/Exame');

const app = express();
app.use(express.json());

// Rotas simuladas para os testes
app.post('/exames', ExameUsuarioController.cadastrarExameUsuario);
app.get('/exames', ExameUsuarioController.listarExamesUsuarios);
app.get('/exames/:id', ExameUsuarioController.buscarExameUsuarioPorId);
app.put('/exames/:id', ExameUsuarioController.atualizarExameUsuario);
app.delete('/exames/:id', ExameUsuarioController.excluirExameUsuario);

const mockExame = {
        _id: 'exameid123',
        nome: 'Hemograma',
    };

const mockExameUsuario = {
    _id: 'exameusuarioid123',
    usuarioId: 'usuarioid123',
    exameId: mockExame._id,
    dataRealizacao: '2024-05-15',
    resultado: 'Normal',
    consultaId: null,
    createdAt: '2024-05-15T10:00:00.000Z',
    updatedAt: '2024-05-15T10:00:00.000Z',
};


describe('ExameUsuarioController', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /exames', () => {
        it('deve cadastrar um novo exame de usuário', async () => {
            Exame.findById.mockResolvedValue(mockExame);
            ExameUsuario.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(mockExameUsuario)
            }));

            const response = await request(app).post('/exames').send({
                usuarioId: mockExameUsuario.usuarioId,
                exameId: mockExameUsuario.exameId,
                dataRealizacao: mockExameUsuario.dataRealizacao,
                resultado: mockExameUsuario.resultado,
                consultaId: null
            });

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject(mockExameUsuario);
        });

        it('deve retornar 404 se o exame não existir', async () => {
            Exame.findById.mockResolvedValue(null);

            const response = await request(app).post('/exames').send({
                usuarioId: mockExameUsuario.usuarioId,
                exameId: mockExameUsuario.exameId,
                dataRealizacao: mockExameUsuario.dataRealizacao,
                resultado: mockExameUsuario.resultado,
                consultaId: null
            });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Exame não encontrado.' });
        });
    });

    describe('GET /exames', () => {
        it('deve listar todos os exames de usuários', async () => {
            ExameUsuario.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue([mockExameUsuario])
            });
            const response = await request(app).get('/exames');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([mockExameUsuario]);
        });
    });

    describe('GET /exames/:id', () => {
        it('deve buscar um exame de usuário por ID', async () => {
            ExameUsuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockExameUsuario)
            });

            const response = await request(app).get(`/exames/${mockExameUsuario._id}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockExameUsuario);
        });

        it('deve retornar 404 se o exame de usuário não for encontrado', async () => {
            ExameUsuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            const response = await request(app).get(`/exames/${mockExameUsuario._id}`);
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Exame do usuário não encontrado.' });
        });
    });

    describe('PUT /exames/:id', () => {
        it('deve atualizar um exame de usuário', async () => {
            ExameUsuario.findByIdAndUpdate.mockResolvedValue(mockExameUsuario);

            const response = await request(app).put(`/exames/${mockExameUsuario._id}`).send({
                dataRealizacao: mockExameUsuario.dataRealizacao,
                resultado: mockExameUsuario.resultado
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockExameUsuario);
        });

        it('deve retornar 404 se o exame de usuário não for encontrado para atualização', async () => {
            ExameUsuario.findByIdAndUpdate.mockResolvedValue(null);

            const response = await request(app).put(`/exames/${mockExameUsuario._id}`).send({
                dataRealizacao: mockExameUsuario.dataRealizacao,
                resultado: mockExameUsuario.resultado
            });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Exame do usuário não encontrado.' });
        });
    });

    describe('DELETE /exames/:id', () => {
        it('deve excluir um exame de usuário', async () => {
            ExameUsuario.findByIdAndDelete.mockResolvedValue(mockExameUsuario);

            const response = await request(app).delete(`/exames/${mockExameUsuario._id}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Exame do usuário excluído com sucesso.' });
        });

        it('deve retornar 404 se o exame de usuário não for encontrado para exclusão', async () => {
            ExameUsuario.findByIdAndDelete.mockResolvedValue(null);

            const response = await request(app).delete(`/exames/${mockExameUsuario._id}`);
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Exame do usuário não encontrado.' });
        });
    });
});