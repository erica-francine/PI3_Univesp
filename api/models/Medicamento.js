const mongoose = require('mongoose');

const MedicamentoSchema = new mongoose.Schema({
    tipoProduto: { type: String, required: true, trim: true },
    nomeProduto: { type: String, required: true, trim: true },
    categoriaRegulatoria: { type: String, required: false, trim: true },
    numeroRegistroProduto: { type: String, required: true, unique: true, trim: true },
    classeTerapeutica: { type: String, required: false, trim: true },
    empresaDetentoraRegistro: { type: String, required: true, trim: true },
    situacaoRegistro: { type: String, required: true, trim: true },
    principioAtivo: { type: String, required: false, trim: true },
}, { collection: 'medicamentos' }); // Nome personalizado para a coleção

module.exports = mongoose.model('Medicamento', MedicamentoSchema);
