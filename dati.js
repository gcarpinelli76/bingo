const ARCHIVIO_FISSO = (function() {
    let archivio = [];

    function generaSerieDiSei() {
        let serie = Array.from({ length: 6 }, () => Array.from({ length: 3 }, () => new Array(9).fill(null)));
        let numeri = Array.from({ length: 90 }, (_, i) => i + 1);
        numeri.sort(() => Math.random() - 0.5);

        // Distribuiamo i 90 numeri nelle 6 cartelle (15 l'una)
        for (let i = 0; i < 90; i++) {
            let n = numeri[i];
            let col = Math.floor(n / 10);
            if (n === 90) col = 8;

            let inserito = false;
            // Cerchiamo una cartella e una riga che abbiano posto in quella colonna
            // e che non abbiano già 5 numeri in quella riga
            for (let cIdx = 0; cIdx < 6 && !inserito; cIdx++) {
                for (let rIdx = 0; rIdx < 3 && !inserito; rIdx++) {
                    let riga = serie[cIdx][rIdx];
                    let numInRiga = riga.filter(x => x !== null).length;
                    
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
