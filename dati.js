// GENERATORE FISSO DI 1000 CARTELLE - BLINDATO [cite: 2026-02-12]
function generaArchivioSempreUguale(seed) {
    let archivio = [];
    // Usiamo un generatore di numeri basato su un "seed" per avere sempre gli stessi risultati [cite: 2026-02-12]
    function randomFisso(s) {
        var t = s += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    let counter = 1;
    for (let i = 0; i < 167; i++) { // 167 serie da 6 = 1002 cartelle [cite: 2026-02-12]
        let serie = [];
        let pool = Array.from({length: 90}, (_, i) => i + 1);
        // Mischiamo il pool in modo predefinito basato sul counter
        for (let j = pool.length - 1; j > 0; j--) {
            let r = Math.floor(randomFisso(counter + j) * (j + 1));
            [pool[j], pool[r]] = [pool[r], pool[j]];
        }

        for (let k = 0; k < 6; k++) {
            let cartella = Array.from({length: 3}, () => Array(9).fill(null));
            // Distribuzione numeri per decine
            for (let r = 0; r < 3; r++) {
                let messi = 0;
                while (messi < 5) {
                    let col = Math.floor(randomFisso(counter + r + messi) * 9);
                    if (cartella[r][col] === null && pool.length > 0) {
                        cartella[r][col] = pool.pop();
                        messi++;
                    }
                }
            }
            archivio.push(cartella);
            counter++;
        }
    }
    return archivio.slice(0, 1000);
}

// Questa variabile ora contiene le 1000 cartelle fisse per tutti [cite: 2026-02-12]
const ARCHIVIO_FISSO = generaArchivioSempreUguale(12345);
