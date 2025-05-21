const mongoose = require('mongoose');

const ConsultaUsuarioSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', // Referência ao modelo de usuário
        required: true
    },
    dataConsulta: {
        type: Date,
        required: true
    },
    descricao: {
        type: String,
        required: false // Descrição opcional da consulta
    },
    nomeMedico: {
        type: String,
        required: false // Nome do médico opcional
    },
    exames: [
        {
            exameUsuarioId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ExameUsuario', // Referência ao modelo ExameUsuario
                required: true
            }
        }
    ],
    medicamentos: [
        {
            medicamentoUsuarioId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'MedicamentoUsuario', // Referência ao modelo MedicamentoUsuario
                required: true
            }
        }
    ],
    cid10: [
        {
            cidUsuarioId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CidUsuario', // Referência ao modelo CidUsuario
                required: true
            }
        }
    ],
    status: {
        type: String,
        enum: ['ativo', 'cancelado', 'concluido'],
        default: 'ativo'
    }
}, {
    collection: 'consultasUsuarios',
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('ConsultaUsuario', ConsultaUsuarioSchema);
