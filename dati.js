// GENERATORE FISSO DI 1000 CARTELLE CON LOGICA A SERIE (90 numeri ogni 6 cartelle)
const ARCHIVIO_FISSO = (function() {
    let archivio = [];
    
    // Funzione per generare numeri casuali ma fissi
    function randomFisso(s) {
        var t = s += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    let seed = 12345;
    for (let s = 0; s < 167; s++) { // Genera 167 serie da 6 cartelle
        let serie = Array.from({length: 6}, () => Array.from({length: 3}, () => Array(9).fill(null)));
        let numeriDisponibili = Array.from({length: 90}, (_, i) => i + 1);
        
        // Distribuzione dei 90 numeri nelle 6 cartelle della serie
        numeriDisponibili.forEach(n => {
            let col = n === 90 ? 8 : Math.floor(n / 10);
            let inserito = false;
            for (let tentativi = 0; tentativi < 100 && !inserito; tentativi++) {
                let cartIdx = Math.floor(randomFisso(seed++) * 6);
                let rIdx = Math.floor(randomFisso(seed++) * 3);
                // Controllo: max 5 numeri per riga e cella libera
                if (serie[cartIdx][rIdx][col] === null && serie[cartIdx][rIdx].filter(x => x !== null).length < 5) {
                    serie[cartIdx][rIdx][col] = n;
                    inserito = true;
                }
            }
        });
        archivio = archivio.concat(serie);
    }
    return archivio.slice(0, 1000);
})();
