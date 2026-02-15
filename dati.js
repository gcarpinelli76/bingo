const ARCHIVIO_FISSO = (function() {
    let archivio = [];

    function generaSerieDiSei() {
        // 18 righe totali per 6 cartelle [cite: 2026-02-15]
        let serie = Array.from({ length: 6 }, () => 
            Array.from({ length: 3 }, () => new Array(9).fill(null))
        );
        
        // Prepariamo i 90 numeri divisi per colonne [cite: 2026-02-14, 2026-02-15]
        let colonnePool = Array.from({ length: 9 }, () => []);
        for (let i = 1; i <= 90; i++) {
            let col = Math.floor(i / 10);
            if (i === 90) col = 8;
            colonnePool[col].push(i);
        }
        colonnePool.forEach(pool => pool.sort(() => Math.random() - 0.5));

        // Riempiamo le righe garantendo 5 numeri per ognuna [cite: 2026-02-14]
        for (let cIdx = 0; cIdx < 6; cIdx++) {
            for (let rIdx = 0; rIdx < 3; rIdx++) {
                let riga = serie[cIdx][rIdx];
                let count = 0;
                
                // Priorità alle colonne che hanno più numeri rimasti nel pool [cite: 2026-02-15]
                let ordineColonne = [0,1,2,3,4,5,6,7,8].sort((a, b) => {
                    return colonnePool[b].length - colonnePool[a].length || Math.random() - 0.5;
                });

                for (let col of ordineColonne) {
                    if (count < 5 && colonnePool[col].length > 0 && riga[col] === null) {
                        riga[col] = colonnePool[col].pop();
                        count++;
                    }
                }
            }
        }

        // Recupero finale: se qualche riga è rimasta sotto i 5 numeri [cite: 2026-02-15]
        for (let c = 0; c < 6; c++) {
            for (let r = 0; r < 3; r++) {
                while (serie[c][r].filter(x => x !== null).length < 5) {
                    let colLibera = colonnePool.findIndex(p => p.length > 0);
                    if (colLibera === -1) break;
                    serie[c][r][colLibera] = colonnePool[colLibera].pop();
                }
            }
        }
        return serie;
    }

    while (archivio.length < 1000) {
        archivio = archivio.concat(generaSerieDiSei());
    }
    return archivio.slice(0, 1000);
})();
