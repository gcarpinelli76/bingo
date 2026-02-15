const ARCHIVIO_FISSO = (function() {
    let archivio = [];

    function generaSerieDiSei() {
        let serie = Array.from({ length: 6 }, () => Array.from({ length: 3 }, () => new Array(9).fill(null)));
        let numeri = Array.from({ length: 90 }, (_, i) => i + 1);
        numeri.sort(() => Math.random() - 0.5);

        for (let n of numeri) {
            // LOGICA COLONNE: 1-9 col 0, 10-19 col 1... 80-90 col 8 [cite: 2026-02-15]
            let col = Math.floor(n / 10);
            if (n === 90) col = 8; // Il 90 va nella colonna 9 (indice 8) [cite: 2026-02-15]

            let inserito = false;
            for (let cIdx = 0; cIdx < 6 && !inserito; cIdx++) {
                for (let rIdx = 0; rIdx < 3 && !inserito; rIdx++) {
                    let riga = serie[cIdx][rIdx];
                    let numInRiga = riga.filter(x => x !== null).length;
                    
                    // Inserisce SOLO se la colonna è quella corretta per il numero [cite: 2026-02-14]
                    if (riga[col] === null && numInRiga < 5) {
                        riga[col] = n;
                        inserito = true;
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
