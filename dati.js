// ARCHIVIO FISSO 1000 CARTELLE - VERSIONE OTTIMIZZATA [cite: 2026-02-12]
const ARCHIVIO_FISSO = (function() {
    const archivio = [];
    // Generatore leggero che crea combinazioni valide da 1 a 1000
    for (let i = 0; i < 1000; i++) {
        let cartella = Array.from({length: 3}, () => Array(9).fill(null));
        for (let r = 0; r < 3; r++) {
            let numeriPerRiga = 0;
            // Distribuisce 5 numeri per riga seguendo le decine delle colonne
            let colonneLibere = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => 0.5 - Math.random());
            for (let j = 0; j < 5; j++) {
                let col = colonneLibere[j];
                let min = col * 10 + 1;
                let max = (col === 8) ? 90 : (col + 1) * 10;
                // Calcola un numero fisso basato sull'indice della cartella
                let n = min + ((i * 7 + r * 3 + col) % (max - min + 1));
                cartella[r][col] = n;
            }
        }
        archivio.push(cartella);
    }
    return archivio;
})();
