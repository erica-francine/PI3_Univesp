const request = require('supertest');
const express = require('express');
const AuthController = require('../../api/controllers/AuthController');
const Usuario = require('../../api/models/User');
const bcrypt = require('bcrypt');

jest.mock('../../api/models/User');

const app = express();
app.use(express.json());
app.post('/register', AuthController.register);

describe('AuthController - Register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve registrar um novo usuário com sucesso', async () => {
        Usuario.findOne.mockResolvedValue(null); // Simula que o usuário não existe
        Usuario.prototype.save = jest.fn().mockResolvedValue(true); // Simula o salvamento do usuário

        const response = await request(app).post('/register').send({
            nome: 'João Silva',
            cpf: '12345678901',
            email: 'joao@email.com',
            telefone: '11999999999',
            sexo: 'Masculino',
            dataNascimento: '1990-01-01',
            senha: 'senha123'
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Usuário cadastrado com sucesso!' });
    });

    it('deve retornar 400 se o usuário já estiver cadastrado', async () => {
        Usuario.findOne.mockResolvedValue({ cpf: '12345678901' }); // Simula que o usuário já existe

        const response = await request(app).post('/register').send({
            nome: 'João Silva',
            cpf: '12345678901',
            email: 'joao@email.com',
            telefone: '11999999999',
            sexo: 'Masculino',
            dataNascimento: '1990-01-01',
            senha: 'senha123'
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Usuário já cadastrado com este CPF ou email.' });
    });

    it('deve retornar 500 em caso de erro interno', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Silencia o console.error
    
        Usuario.findOne.mockRejectedValue(new Error('Erro interno')); // Simula um erro no banco de dados
    
        const response = await request(app).post('/register').send({
            nome: 'João Silva',
            cpf: '12345678901',
            email: 'joao@email.com',
            telefone: '11999999999',
            sexo: 'Masculino',
            dataNascimento: '1990-01-01',
            senha: 'senha123'
        });
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Erro interno no servidor.' });
    
        consoleErrorSpy.mockRestore(); // Restaura o comportamento original do console.error
    });
});
