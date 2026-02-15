// ARCHIVIO BLINDATO - 1000 CARTELLE FISSE
const ARCHIVIO_FISSO = (function() {
    let archivio = [];
    // Il SEME FISSO garantisce che le cartelle siano identiche ovunque
    let seed = 12345; 
    function seededRandom() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    function generaSerieDiSei() {
        let serie = Array.from({ length: 6 }, () => 
            Array.from({ length: 3 }, () => new Array(9).fill(null))
        );
        
        let colonnePool = Array.from({ length: 9 }, () => []);
        for (let i = 1; i <= 90; i++) {
            let col = Math.floor(i / 10);
            if (i === 90) col = 8;
            colonnePool[col].push(i);
        }
        
        // Mischia i pool usando il seme fisso
        colonnePool.forEach(pool => {
            pool.sort(() => seededRandom() - 0.5);
        });

        // Riempimento principale delle righe
        for (let cIdx = 0; cIdx < 6; cIdx++) {
            for (let rIdx = 0; rIdx < 3; rIdx++) {
                let count = 0;
                let ordineColonne = [0,1,2,3,4,5,6,7,8].sort((a, b) => {
                    return colonnePool[b].length - colonnePool[a].length || seededRandom() - 0.5;
                });

                for (let col of ordineColonne) {
                    if (count < 5 && colonnePool[col].length > 0 && serie[cIdx][rIdx][col] === null) {
                        serie[cIdx][rIdx][col] = colonnePool[col].pop();
                        count++;
                    }
                }
            }
        }

        // Recupero finale per garantire che ogni riga abbia ESATTAMENTE 5 numeri
        for (let c = 0; c < 6; c++) {
            for (let r = 0; r < 3; r++) {
                while (serie[c][r].filter(x => x !== null).length < 5) {
                    let colLibera = colonnePool.findIndex(p => p.length > 0);
                    if (colLibera === -1) break;
                    // Inserisce il numero nella colonna corretta se possibile, altrimenti nella prima libera
                    let n = colonnePool[colLibera].pop();
                    let targetCol = Math.floor(n / 10);
                    if (n === 90) targetCol = 8;
                    
                    if (serie[c][r][targetCol] === null) {
                        serie[c][r][targetCol] = n;
                    } else {
                        let firstEmpty = serie[c][r].indexOf(null);
                        if (firstEmpty !== -1) serie[c][r][firstEmpty] = n;
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
