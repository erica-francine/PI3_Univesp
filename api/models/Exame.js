const mongoose = require('mongoose');

const exameSchema = new mongoose.Schema({
    nome: { type: String, required: false, trim: true },
    codigoTuss: { type: String, required: false, unique: true, trim: true },
}, { collection: 'exames' }); // Nome personalizado para a coleção

module.exports = mongoose.model('Exame', exameSchema);
