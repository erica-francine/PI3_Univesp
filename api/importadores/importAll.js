const { exec } = require('child_process');

const importadores = [
    'node ./api/importadores/importaMedicamentos.js',
    'node ./api/importadores/importaCid10.js',
    'node ./api/importadores/importaExames.js'
];

(async () => {
    for (const comando of importadores) {
        console.log(`⏳ Executando: ${comando}`);
        try {
            await new Promise((resolve, reject) => {
                const processo = exec(comando, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`❌ Erro ao executar ${comando}:`, error.message);
                        return reject(error);
                    }
                    if (stderr) console.error(stderr);
                    console.log(stdout);
                    resolve();
                });

                processo.stdout.pipe(process.stdout);
                processo.stderr.pipe(process.stderr);
            });
            console.log(`✅ Finalizado: ${comando}`);
        } catch (err) {
            console.error(`❌ Falha ao executar ${comando}`);
        }
    }
    console.log('✅ Todas as importações foram concluídas!');
})();
