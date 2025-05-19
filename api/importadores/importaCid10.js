require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');

// Modelo flexível
const CID10Schema = new mongoose.Schema({
    cid10: { type: String, required: false },
    descricao: { type: String, required: false }
}, { strict: false });

const Cid10 = mongoose.model('Cid10', CID10Schema);

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
    /* useNewUrlParser: true, */
    /* useUnifiedTopology: true, */
    maxPoolSize: 10
});

mongoose.connection.on('connected', async () => {
    console.log('---------------------------------------------------------------------');
    console.log('✅ Conectado ao MongoDB Atlas');
    
    try {
        // Limpar a coleção cid10
        await Cid10.deleteMany({});
        console.log('🗑️ Coleção cid10 limpa com sucesso.');
        console.log('⏳ Iniciando importação de CIDs...');
        const startTime = new Date();
        let importedCount = 0;
        let incompleteCount = 0;
        const batchSize = 500;
        let batch = [];

        const stream = fs.createReadStream(path.join(__dirname, '../dados/cid10.csv'))
            .pipe(require('iconv-lite').decodeStream('latin1'))
            .pipe(csv({
                separator: ';',
                mapHeaders: ({ header }) => header.trim(),
                mapValues: ({ value }) => value.trim() === '' ? null : value.trim()
            }))
            .on('data', async (row) => {
                const doc = {
                    cid10: row['SUBCAT'] || null,
                    descricao: row['DESCRICAO'] || null
                };

                if (!doc.cid10 && !doc.descricao) incompleteCount++;
                batch.push(doc);

                if (batch.length >= batchSize) {
                    stream.pause();
                    try {
                        await Cid10.insertMany(batch, { ordered: false });
                        importedCount += batch.length;
                        /* console.log(`✓ Lote de ${batch.length} CIDs inserido (Total: ${importedCount})`); */
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
                        await Cid10.insertMany(batch, { ordered: false });
                        importedCount += batch.length;
                        /* console.log(`✓ Último lote de ${batch.length} CIDs inserido`); */
                    } catch (err) {
                        importedCount += err.insertedCount || 0;
                        /* console.log(`✓ Parcial final: ${err.insertedCount || 0} de ${batch.length} inseridos`); */
                    }
                }

                const endTime = new Date();
                const duration = (endTime - startTime) / 1000;
                
                console.log('\n📊 Resumo da Importação:');
                console.log(`• CIDs importados: ${importedCount}`);
                console.log(`• CIDs muito incompletos: ${incompleteCount}`);
                console.log(`• Tempo total: ${duration} segundos`);
                console.log('✅ Importação de CIDs concluída!');
                console.log('---------------------------------------------------------------------');

                mongoose.disconnect();
            });
    } catch (err) {
        console.error('❌ Erro durante a importação:', err);
        mongoose.disconnect();
    }
});
