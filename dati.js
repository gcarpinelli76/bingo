// ARCHIVIO CRISTALLIZZATO - 1000 CARTELLE [cite: 2026-02-12]
const ARCHIVIO_FISSO = (function() {
    const archivio = [];
    
    // Funzione di generazione matematica pura (senza .sort instabile) [cite: 2026-02-15]
    function generaCartella(id) {
        let cartella = Array.from({ length: 3 }, () => new Array(9).fill(null));
        let numeriUsati = new Set();
        
        for (let r = 0; r < 3; r++) {
            let numeriInRiga = 0;
            // Usiamo l'ID della cartella e la riga per creare una sequenza fissa
            let tentativi = 0;
            while (numeriInRiga < 5 && tentativi < 100) {
                // Calcolo matematico deterministico per la colonna
                let col = (Math.abs(Math.sin(id * 10 + r * 5 + tentativi)) * 9) | 0;
                
                if (cartella[r][col] === null) {
                    // Calcolo fisso per il numero nella colonna
                    let min = col * 10 + (col === 0 ? 1 : 0);
                    let max = col * 10 + 9 + (col === 8 ? 1 : 0);
                    let range = max - min + 1;
                    let num = min + ((Math.abs(Math.cos(id * 2 + r * 3 + tentativi)) * range) | 0);
                    
                    if (!numeriUsati.has(num)) {
                        cartella[r][col] = num;
                        numeriUsati.add(num);
                        numeriInRiga++;
                    }
                }
                tentativi++;
            }
        }
        return cartella;
    }

    for (let i = 1; i <= 1000; i++) {
        archivio.push(generaCartella(i));
    }
    return archivio;
})();
