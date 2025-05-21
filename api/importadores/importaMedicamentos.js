require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');

// Modelo flexível
const medicamentoSchema = new mongoose.Schema({
    nome: { type: String, required: false },
    codigoTuss: { type: String, required: false },
    categoria: { type: String, required: false }
}, { strict: false });

const Medicamento = mongoose.model('Medicamento', medicamentoSchema);

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
    /* useNewUrlParser: true, */
    /* useUnifiedTopology: true, */
    dbName: 'fichaMedica', // Nome do banco de dados
    maxPoolSize: 10
});

mongoose.connection.on('connected', async () => {
    console.log('---------------------------------------------------------------------');
    console.log('✅ Conectado ao MongoDB');
    
    try {
        // Limpar a coleção Medicamento
        await Medicamento.deleteMany({});
        console.log('🗑️ Coleção Medicamento limpa com sucesso.');
        console.log('⏳ Iniciando importação de medicamentos...');
        const startTime = new Date();
        let importedCount = 0;
        let incompleteCount = 0;
        const batchSize = 500;
        let batch = [];

        const stream = fs.createReadStream(path.join(__dirname, '../dados/medicamentos.csv'))
            .pipe(require('iconv-lite').decodeStream('latin1'))
            .pipe(csv({
                separator: ';',
                mapHeaders: ({ header }) => header.trim(),
                mapValues: ({ value }) => value.trim() === '' ? null : value.trim()
            }))
            .on('data', async (row) => {
                const doc = {
                    tipoProduto: row['TIPO_PRODUTO'] || null,
                    nomeProduto: row['NOME_PRODUTO'] || null,
                    categoriaRegulatoria: row['CATEGORIA_REGULATORIA'] || null,
                    numeroRegistroProduto: row['NUMERO_REGISTRO_PRODUTO'] || null,
                    classeTerapeutica: row['CLASSE_TERAPEUTICA'] || null,
                    empresaDetentoraRegistro: row['EMPRESA_DETENTORA_REGISTRO'] || null,
                    situacaoRegistro: row['SITUACAO_REGISTRO'] || null,
                    principioAtivo: row['PRINCIPIO_ATIVO'] || null
                };

                if (!doc.nome && !doc.codigoTuss) incompleteCount++;
                batch.push(doc);

                if (batch.length >= batchSize) {
                    stream.pause();
                    try {
                        await Medicamento.insertMany(batch, { ordered: false });
                        importedCount += batch.length;
                        /* console.log(`✓ Lote de ${batch.length} medicamentos inserido (Total: ${importedCount})`); */
                    } catch (err) {
                        importedCount += err.insertedCount || 0;
                        /* console.log(`✓ Parcial: ${err.insertedCount || 0} de ${batch.length} inseridos`); */
                    }
                    batch = [];
                    stream.resume();
                }
            })
            .on('end', async () => {
                if (batch.length > 0) {
                    try {
                        await Medicamento.insertMany(batch, { ordered: false });
                        importedCount += batch.length;
                        /* console.log(`✓ Último lote de ${batch.length} medicamentos inserido`); */
                    } catch (err) {
                        importedCount += err.insertedCount || 0;
                        /* console.log(`✓ Parcial final: ${err.insertedCount || 0} de ${batch.length} inseridos`); */
                    }
                }

                const endTime = new Date();
                const duration = (endTime - startTime) / 1000;
                
                console.log('\n📊 Resumo da Importação:');
                console.log(`• Medicamentos importados: ${importedCount}`);
                console.log(`• Medicamentos muito incompletos: ${incompleteCount}`);
                console.log(`• Tempo total: ${duration} segundos`);
                console.log('✅ Importação de medicamentos concluída!');
                console.log('---------------------------------------------------------------------');

                mongoose.disconnect();
            });
    } catch (err) {
        console.error('❌ Erro durante a importação:', err);
        mongoose.disconnect();
    }
});
mongoose.connection.on('error', (err) => {
    console.error('❌ Erro de conexão com o MongoDB:', err);
});
