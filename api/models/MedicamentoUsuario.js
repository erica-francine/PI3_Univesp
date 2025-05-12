const mongoose = require('mongoose');

const MedicamentoUsuarioSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    medicamentoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicamento',
        required: true
    },
    inicio: {
        type: Date,
        required: true
    },
    dosagem: {
        type: String,
        required: true
    },
    periodicidade: {
        tipo: {
            type: String,
            enum: ['Intervalo', 'Horário fixo', 'Sob demanda'],
            required: true
        },
        unidadeIntervalo: {
            type: String,
            enum: ['Horas', 'Dias', 'Semanas', 'Meses'],
            required: function () { return this.tipo === 'Intervalo'; }
        },
        valorIntervalo: {
            type: Number,
            required: function () { return this.tipo === 'Intervalo'; },
            min: 1
        },
        horariosFixos: {
            type: [String], // Exemplo: ['08:00', '14:00']
            required: function () { return this.tipo === 'Horário fixo'; }
        },
        duracaoDias: {
            type: Number,
            required: function () { return !this.usoContinuo; },
            min: 1
        }
    },
    usoContinuo: {
        type: Boolean,
        default: false // Por padrão, o medicamento não é de uso contínuo
    },
    consultaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consulta',
        required: false,
        default: null
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo', 'concluido'],
        default: 'ativo'
    },
    
}, {
    collection: 'medicamentosUsuarios', // Nome personalizado para a coleção
    timestamps: true
});

module.exports = mongoose.model('MedicamentoUsuario', MedicamentoUsuarioSchema);