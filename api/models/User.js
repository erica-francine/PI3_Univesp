const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        minlength: 3
    },
    cpf: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^\d{11}$/.test(v); // Valida CPF com 11 dígitos numéricos
            },
            message: props => `${props.value} não é um CPF válido!`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Valida formato de email
            },
            message: props => `${props.value} não é um email válido!`
        }
    },
    telefone: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{10,11}$/.test(v); // Valida telefone com 10 ou 11 dígitos
            },
            message: props => `${props.value} não é um telefone válido!`
        }
    },
    sexo: {
        type: String,
        enum: ['Masculino', 'Feminino', 'Outro'], // Valores permitidos
        required: true
    },
    dataNascimento: {
        type: Date,
        required: true
    },
    senha: {
        type: String,
        required: true,
        minlength: 8
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'usuarios', 
    timestamps: true // Adiciona automaticamente createdAt e updatedAt
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = Usuario;