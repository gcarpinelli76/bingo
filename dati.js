const ARCHIVIO_FISSO = (function() {
    let archivio = [];

    function generaSerieDiSei() {
        // Inizializziamo 6 cartelle vuote (3 righe x 9 colonne) [cite: 2026-02-15]
        let serie = Array.from({ length: 6 }, () => 
            Array.from({ length: 3 }, () => new Array(9).fill(null))
        );
        
        // Organizziamo i 90 numeri per colonne (decina) [cite: 2026-02-14]
        let colonnePool = Array.from({ length: 9 }, () => []);
        for (let i = 1; i <= 90; i++) {
            let col = Math.floor(i / 10);
            if (i === 90) col = 8;
            colonnePool[col].push(i);
        }
        
        // Mischiamo i numeri dentro ogni colonna per varietà [cite: 2026-02-15]
        colonnePool.forEach(pool => pool.sort(() => Math.random() - 0.5));

        // Riempiamo ogni riga di ogni cartella (18 righe totali) [cite: 2026-02-15]
        for (let cIdx = 0; cIdx < 6; cIdx++) {
            for (let rIdx = 0; rIdx < 3; rIdx++) {
                let numeriInseritiInRiga = 0;
                
                // Proviamo a inserire un numero per colonna finché non arriviamo a 5 [cite: 2026-02-14]
                // Usiamo un ordine casuale delle colonne per non riempire sempre le stesse
                let ordineColonne = [0,1,2,3,4,5,6,7,8].sort(() => Math.random() - 0.5);
                
                for (let col of ordineColonne) {
                    if (numeriInseritiInRiga < 5 && colonnePool[col].length > 0) {
                        // Inseriamo il numero solo se quella colonna nella cartella è libera
                        // e se non abbiamo già numeri in quella riga per quella colonna
                        if (serie[cIdx][rIdx][col] === null) {
                            serie[cIdx][rIdx][col] = colonnePool[col].pop();
                            numeriInseritiInRiga++;
                        }
                    }
                }
            }
        }
        
        // Se avanzano numeri (raro), li distribuiamo dove c'è spazio [cite: 2026-02-15]
        colonnePool.forEach((pool, colIdx) => {
            while (pool.length > 0) {
                let n = pool.pop();
                let inserito = false;
                for (let c = 0; c < 6 && !inserito; c++) {
                    for (let r = 0; r < 3 && !inserito; r++) {
                        if (serie[c][r][colIdx] === null && serie[c][r].filter(x => x !== null).length < 5) {
                            serie[c][r][colIdx] = n;
                            inserito = true;
                        }
                    }
                }
            }
        });

        return serie;
    }

    while (archivio.length < 1000) {
        archivio = archivio.concat(generaSerieDiSei());
    }
    return archivio.slice(0, 1000);
})();
