const mongoose = require('mongoose');

const CID10Schema = new mongoose.Schema({
    cid10: { type: String, required: true, unique: true, uppercase: true, trim: true },
    descricao: { type: String, required: true, trim: true },
}, { collection: 'cid10' }); // Nome personalizado para a coleção

module.exports = mongoose.model('Cid10', CID10Schema);
