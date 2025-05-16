const request = require('supertest');
const express = require('express');
const CidUsuarioController = require('../../api/controllers/CidUSuarioController');
const CidUsuario = require('../../api/models/CidUsuario');
const Cid10 = require('../../api/models/Cid10');

jest.mock('../../api/models/CidUsuario');
jest.mock('../../api/models/Cid10');

const app = express();
app.use(express.json());

app.post('/cids', CidUsuarioController.cadastrarCidUsuario);
app.get('/cids', CidUsuarioController.listarCidsUsuarios);
app.get('/cids/:id', CidUsuarioController.buscarCidUsuarioPorId);
app.put('/cids/:id', CidUsuarioController.atualizarCidUsuario);
app.delete('/cids/:id', CidUsuarioController.excluirCidUsuario);

const mockCid10 = {
    _id: 'cid10id123',
    codigo: 'A00',
    descricao: 'Cólera'
};

const mockCidUsuario = {
    _id: 'cidusuarioid123',
    usuarioId: 'usuarioid123',
    cidId: mockCid10._id,
    observacoes: 'Paciente apresenta sintomas leves.',
    consultaId: null,
    createdAt: '2024-05-15T10:00:00.000Z',
    updatedAt: '2024-05-15T10:00:00.000Z',
};

describe('CidUsuarioController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /cids', () => {
        it('deve cadastrar um novo CID de usuário', async () => {
            Cid10.findById.mockResolvedValue(mockCid10);
            CidUsuario.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(mockCidUsuario)
            }));

            const response = await request(app).post('/cids').send({
                usuarioId: mockCidUsuario.usuarioId,
                cidId: mockCidUsuario.cidId,
                observacoes: mockCidUsuario.observacoes,
                consultaId: null
            });

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject(mockCidUsuario);
        });

        it('deve retornar 404 se o CID-10 não existir', async () => {
            Cid10.findById.mockResolvedValue(null);

            const response = await request(app).post('/cids').send({
                usuarioId: mockCidUsuario.usuarioId,
                cidId: mockCidUsuario.cidId,
                observacoes: mockCidUsuario.observacoes,
                consultaId: null
            });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'CID-10 não encontrado.' });
        });
    });

    describe('GET /cids', () => {
        it('deve listar todos os CIDs de usuários', async () => {
            CidUsuario.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue([mockCidUsuario])
            });

            const response = await request(app).get('/cids');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([mockCidUsuario]);
        });
    });

    describe('GET /cids/:id', () => {
        it('deve buscar um CID de usuário por ID', async () => {
            CidUsuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCidUsuario)
            });

            const response = await request(app).get(`/cids/${mockCidUsuario._id}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCidUsuario);
        });

        it('deve retornar 404 se o CID de usuário não for encontrado', async () => {
            CidUsuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            const response = await request(app).get(`/cids/${mockCidUsuario._id}`);
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'CID do usuário não encontrado.' });
        });
    });

    describe('PUT /cids/:id', () => {
        it('deve atualizar um CID de usuário', async () => {
            CidUsuario.findByIdAndUpdate.mockResolvedValue(mockCidUsuario);

            const response = await request(app).put(`/cids/${mockCidUsuario._id}`).send({
                observacoes: 'Atualizado'
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCidUsuario);
        });

        it('deve retornar 404 se o CID de usuário não for encontrado para atualização', async () => {
            CidUsuario.findByIdAndUpdate.mockResolvedValue(null);

            const response = await request(app).put(`/cids/${mockCidUsuario._id}`).send({
                observacoes: 'Atualizado'
            });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'CID do usuário não encontrado.' });
        });
    });

    describe('DELETE /cids/:id', () => {
        it('deve excluir um CID de usuário', async () => {
            CidUsuario.findByIdAndDelete.mockResolvedValue(mockCidUsuario);

            const response = await request(app).delete(`/cids/${mockCidUsuario._id}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'CID do usuário excluído com sucesso.' });
        });

        it('deve retornar 404 se o CID de usuário não for encontrado para exclusão', async () => {
            CidUsuario.findByIdAndDelete.mockResolvedValue(null);

            const response = await request(app).delete(`/cids/${mockCidUsuario._id}`);
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'CID do usuário não encontrado.' });
        });
    });
});