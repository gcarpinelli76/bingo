const ARCHIVIO_FISSO = (function() {
    let archivio = [];

    function generaSerieDiSei() {
        // Creiamo 6 cartelle vuote con 3 righe e 9 colonne [cite: 2026-02-15]
        let serie = Array.from({ length: 6 }, () => Array.from({ length: 3 }, () => new Array(9).fill(null)));
        let numeri = Array.from({ length: 90 }, (_, i) => i + 1);
        
        // Mischia i numeri per la varietà [cite: 2026-02-15]
        numeri.sort(() => Math.random() - 0.5);

        for (let n of numeri) {
            // Regola ferrea delle colonne [cite: 2026-02-14, 2026-02-15]
            let col = Math.floor(n / 10);
            if (n === 90) col = 8; // Il 90 va fisso nell'ultima colonna [cite: 2026-02-15]

            let inserito = false;
            // Cerchiamo una cartella (0-5) e una riga (0-2) [cite: 2026-02-15]
            for (let cIdx = 0; cIdx < 6 && !inserito; cIdx++) {
                for (let rIdx = 0; rIdx < 3 && !inserito; rIdx++) {
                    let riga = serie[cIdx][rIdx];
                    let numInRiga = riga.filter(x => x !== null).length;
                    
                    // Inserisce solo se la cella è libera E la riga ha meno di 5 numeri [cite: 2026-02-14, 2026-02-15]
                    if (riga[col] === null && numInRiga < 5) {
                        riga[col] = n;
                        inserito = true;
                    }
                }
            }
            
            // Logica di emergenza: se il numero è rimasto fuori, lo forza nella prima riga con spazio
            if (!inserito) {
                for (let cIdx = 0; cIdx < 6 && !inserito; cIdx++) {
                    for (let rIdx = 0; rIdx < 3 && !inserito; rIdx++) {
                        if (serie[cIdx][rIdx].filter(x => x !== null).length < 5) {
                            // Cerca una colonna libera qualsiasi in quella riga per non perdere il numero
                            for(let q=0; q<9; q++) {
                                if(serie[cIdx][rIdx][q] === null) {
                                    serie[cIdx][rIdx][q] = n;
                                    inserito = true; break;
                                }
                            }
                        }
                    }
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
