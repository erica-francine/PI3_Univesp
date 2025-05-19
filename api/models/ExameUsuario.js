const mongoose = require('mongoose');

const ExameUsuarioSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    exameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exame',
        required: true
    },
    data: {
        type: Date,
        required: true
    },
    resultado: {
        type: String,
        required: true
    },
    consultaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Consulta',
            required: false,
            default: null
    },

}, {
    collection: 'examesUsuarios', // Nome personalizado para a coleção
});

module.exports = mongoose.model('ExameUsuario', ExameUsuarioSchema);
