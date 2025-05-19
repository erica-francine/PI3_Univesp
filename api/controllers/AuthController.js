const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/User'); // Importa o modelo de usuário
const validate = require('./Validate'); 

module.exports = {
    // Middleware de autenticação
    authMiddleware(req, res, next) {
        const token = req.cookies['authorization-token'];

        if (!token) return res.status(401).json({message: "Acesso negado. Token não fornecido"});

        try {
            const userVerificado = jwt.verify(token, process.env.TOKEN_SECRET);
            req.user = userVerificado;
            next();
        } catch (error) {
            res.status(401).json({ message: "Acesso negado" });
        }
    },

    // Registro de usuário
    async register(req, res) {
        try {
            // Validação dos dados
            const { error } = validate.registerValidate(req.body);
            if (error) {
                return res.status(400).json({ message: error.message });
            }

            // Verifica se o usuário já existe pelo CPF ou email
            const usuarioExistente = await Usuario.findOne({
                $or: [{ cpf: req.body.cpf }, { email: req.body.email }]
            });
            if (usuarioExistente) {
                return res.status(400).json({ message: 'Usuário já cadastrado com este CPF ou email.' });
            }

            // Cria o usuário
            const novoUsuario = new Usuario({
                nome: req.body.nome,
                cpf: req.body.cpf,
                email: req.body.email,
                telefone: req.body.telefone,
                sexo: req.body.sexo,
                dataNascimento: req.body.dataNascimento,
                senha: bcrypt.hashSync(req.body.senha, 10), // Hash da senha
                status: true
            });

            await novoUsuario.save();
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
        } catch (err) {
            console.error('Erro no registro:', err);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    },

    // Login de usuário
    async login(req, res) {
        try {
            const { error } = validate.loginValidate(req.body);
            if (error) {
                return res.status(400).json({message: error.message});
            }

            // Verifica se o usuário existe pelo CPF
            const usuarioSelecionado = await Usuario.findOne({ cpf: req.body.cpf });
            if (!usuarioSelecionado) {
                return res.status(400).json({message:'CPF ou senha incorretos'});
            }

            // Verifica a senha
            const senhaUsuarioMatch = bcrypt.compareSync(req.body.senha, usuarioSelecionado.senha);
            if (!senhaUsuarioMatch) {
                return res.status(400).json({message: 'CPF ou senha incorretos'});
            }

            // Gera o token JWT com apenas o ID e o CPF
            const token = jwt.sign(
                { id: usuarioSelecionado._id, cpf: usuarioSelecionado.cpf },
                process.env.TOKEN_SECRET,
                { expiresIn: '1h' }
            );

            // Define o token no cookie
            res.cookie('authorization-token', token, {
                httpOnly: true,
                maxAge: 3600000, // 1 hora
            });

            res.status(200).json({message: 'Usuário logado', userName: usuarioSelecionado.nome, userId: usuarioSelecionado._id});
        } catch (error) {
            console.error("Erro no login:", error);
            res.status(500).json({ error: "Erro no login do usuário." });
        }
    },

    async logout(req, res) {
        try {
            // Limpa o cookie que contém o token
            res.clearCookie('authorization-token', {
                httpOnly: true,
                // secure: true, 
            });

            res.status(200).json({message:'Logout realizado com sucesso'});
        } catch (error) {
            console.error("Erro no logout:", error);
            res.status(500).json({ error: "Erro ao realizar logout." });
        }
    },
};
