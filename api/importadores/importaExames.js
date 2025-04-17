require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');

// Modelo flexível
const exameSchema = new mongoose.Schema({
    nome: { type: String, required: false },
    codigoTuss: { type: String, required: false }
}, { strict: false });

const Exame = mongoose.model('Exame', exameSchema);

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
    /* useNewUrlParser: true, */
    /* useUnifiedTopology: true, */
    maxPoolSize: 10
});

mongoose.connection.on('connected', async () => {
    console.log('---------------------------------------------------------------------');
    console.log('✅ Conectado ao MongoDB');
    
    try {
        // Limpar a coleção Exame
        await Exame.deleteMany({});
        console.log('🗑️ Coleção Exame limpa com sucesso.');
        console.log('⏳ Iniciando importação de exames...');
        const startTime = new Date();
        let importedCount = 0;
        let incompleteCount = 0;
        const batchSize = 500;
        let batch = [];

        const stream = fs.createReadStream(path.join(__dirname, '../dados/exames.csv'))
            .pipe(require('iconv-lite').decodeStream('utf-8'))
            .pipe(csv({
                separator: ';',
                mapHeaders: ({ header }) => header.trim(),
                mapValues: ({ value }) => value.trim() === '' ? null : value.trim()
            }))
            .on('data', async (row) => {
                const doc = {
                    nome: row['Termo'] || null,
                    codigoTuss: row['Código do Termo'] || null
                };

                if (!doc.nome && !doc.codigoTuss) incompleteCount++;
                batch.push(doc);

                if (batch.length >= batchSize) {
                    stream.pause();
                    try {
                        await Exame.insertMany(batch, { ordered: false });
                        importedCount += batch.length;
                        /* console.log(`✓ Lote de ${batch.length} exames inserido (Total: ${importedCount})`); */
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
                        await Exame.insertMany(batch, { ordered: false });
                        importedCount += batch.length;
                        /* console.log(`✓ Último lote de ${batch.length} exames inserido`); */
                    } catch (err) {
                        importedCount += err.insertedCount || 0;
                        /* console.log(`✓ Parcial final: ${err.insertedCount || 0} de ${batch.length} inseridos`); */
                    }
                }

                const endTime = new Date();
                const duration = (endTime - startTime) / 1000;
                
                console.log('\n📊 Resumo da Importação:');
                console.log(`• Exames importados: ${importedCount}`);
                console.log(`• Exames muito incompletos: ${incompleteCount}`);
                console.log(`• Tempo total: ${duration} segundos`);
                console.log('✅ Importação de exames concluída!');
                console.log('---------------------------------------------------------------------');

                mongoose.disconnect();
            });
    } catch (err) {
        console.error('❌ Erro durante a importação:', err);
        mongoose.disconnect();
    }
});
