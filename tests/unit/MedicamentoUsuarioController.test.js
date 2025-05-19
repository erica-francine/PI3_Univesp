const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const MedicamentoUsuario = require('../../api/models/MedicamentoUsuario');
const MedicamentoUsuarioController = require('../../api/controllers/MedicamentoUsuarioController');

const app = express();
app.use(express.json());

// Mock das rotas para o controller
app.post('/medicamentos', MedicamentoUsuarioController.cadastrarMedicamentoUsuario);
app.get('/medicamentos', MedicamentoUsuarioController.listarMedicamentosUsuario);
app.get('/medicamentos/:id', MedicamentoUsuarioController.buscarMedicamentoPorId);
app.delete('/medicamentos/:id', MedicamentoUsuarioController.excluirMedicamentoUsuario);

// Mock do banco de dados
jest.mock('../../api/models/MedicamentoUsuario');


const mockMedicamento = {
    _id: '64b8f8e2f1a2c8e4d5f6a7b8',
    usuarioId: '64b8f8e2f1a2c8e4d5f6a7b8',
    medicamentoId: '64b8f8e2f1a2c8e4d5f6a7c0',
    inicio: '2023-10-01',
    dosagem: '500mg',
    periodicidade: { tipo: 'Intervalo', unidadeIntervalo: 'Horas', valorIntervalo: 8 },
    usoContinuo: false,
    consultaId: null,
};


MedicamentoUsuario.mockImplementation(function () {
    return {
        save: jest.fn().mockResolvedValue(mockMedicamento)
    };
});


describe('MedicamentoUsuarioController', () => {
    beforeAll(async () => {
        // Conecta ao banco de dados de teste
        await mongoose.connect('mongodb://localhost:27017/testDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        // Desconecta do banco de dados após os testes
        await mongoose.connection.close();
    });

    describe('POST /medicamentosUsuario', () => {
        it('deve cadastrar um novo medicamento', async () => {
            
            // Configura o mock para retornar o objeto esperado
            MedicamentoUsuario.create.mockResolvedValue(mockMedicamento);

            const response = await request(app).post('/medicamentos').send(mockMedicamento);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject(mockMedicamento);
        });
    });

    describe('GET /medicamentosUsuario', () => {
        it('deve listar todos os medicamentos', async () => {
            const mockMedicamentos = [
                {
                    _id: '64b8f8e2f1a2c8e4d5f6a7b8',
                    usuarioId: '64b8f8e2f1a2c8e4d5f6a7b8',
                    medicamentoId: '64b8f8e2f1a2c8e4d5f6a7c0',
                    inicio: '2023-10-01',
                    dosagem: '500mg',
                    periodicidade: { tipo: 'Intervalo', unidadeIntervalo: 'Horas', valorIntervalo: 8 },
                    usoContinuo: false,
                    consultaId: null,
                },
            ];

            MedicamentoUsuario.find.mockResolvedValue(mockMedicamentos);

            const response = await request(app).get('/medicamentos');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMedicamentos);
        });
    });

    describe('GET /medicamentosUsuario/:id', () => {
        it('deve buscar um medicamento por ID', async () => {
            const mockMedicamento = {
                _id: '64b8f8e2f1a2c8e4d5f6a7b8',
                usuarioId: '64b8f8e2f1a2c8e4d5f6a7b8',
                medicamentoId: '64b8f8e2f1a2c8e4d5f6a7c0',
                inicio: '2023-10-01',
                dosagem: '500mg',
                periodicidade: { tipo: 'Intervalo', unidadeIntervalo: 'Horas', valorIntervalo: 8 },
                usoContinuo: false,
                consultaId: null,
            };

            MedicamentoUsuario.findById.mockResolvedValue(mockMedicamento);

            const response = await request(app).get('/medicamentos/64b8f8e2f1a2c8e4d5f6a7b8');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMedicamento);
        });

        it('deve retornar 404 se o medicamento não for encontrado', async () => {
            MedicamentoUsuario.findById.mockResolvedValue(null);

            const response = await request(app).get('/medicamentos/64b8f8e2f1a2c8e4d5f6a7b8');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Medicamento não encontrado.' });
        });
    });

    describe('DELETE /medicamentosUsuario/:id', () => {
        it('deve excluir um medicamento por ID', async () => {
            const mockMedicamento = {
                _id: '64b8f8e2f1a2c8e4d5f6a7b8',
                usuarioId: '64b8f8e2f1a2c8e4d5f6a7b8',
                medicamentoId: '64b8f8e2f1a2c8e4d5f6a7c0',
                inicio: '2023-10-01',
                dosagem: '500mg',
                periodicidade: { tipo: 'Intervalo', unidadeIntervalo: 'Horas', valorIntervalo: 8 },
                usoContinuo: false,
                consultaId: null,
            };

            MedicamentoUsuario.findByIdAndDelete.mockResolvedValue(mockMedicamento);

            const response = await request(app).delete('/medicamentos/64b8f8e2f1a2c8e4d5f6a7b8');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Medicamento excluído com sucesso.' });
        });

        it('deve retornar 404 se o medicamento não for encontrado', async () => {
            MedicamentoUsuario.findByIdAndDelete.mockResolvedValue(null);

            const response = await request(app).delete('/medicamentos/64b8f8e2f1a2c8e4d5f6a7b8');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Medicamento não encontrado.' });
        });
    });

   
});