const mongoose = require('mongoose');

const CidUsuarioSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    cid10Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cid10',
        required: true
    },
    dataDiagnostico: {
        type: Date,
        required: true
    },
    dataFinalizacao: {
        type: Date
    },
    consultaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Consulta',
            required: false,
            default: null
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo'],
        default: 'ativo'
    }
}, {
    collection: 'cidUsuarios', // Nome personalizado para a coleção
    timestamps: true
});




module.exports = mongoose.model('CidUsuario', CidUsuarioSchema);
