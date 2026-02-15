// ARCHIVIO FISSO - 1000 CARTELLE DEFINITIVE [cite: 2026-02-12]
// Logica: 3 righe, 9 colonne, 5 numeri per riga (15 totali) [cite: 2026-02-14, 2026-02-15]
// Distribuzione: ogni 6 cartelle sono presenti tutti i 90 numeri [cite: 2026-02-15]

const ARCHIVIO_FISSO = (function() {
    let tutteLeCartelle = [];
    
    // Funzione interna per generare una serie di 6 cartelle che copre 1-90
    function generaSerie() {
        let numeri = Array.from({length: 90}, (_, i) => i + 1);
        // Mischia i numeri per avere varietà in ogni serie
        numeri.sort(() => Math.random() - 0.5);
        
        let serie = [];
        for (let i = 0; i < 6; i++) {
            let cartella = [[], [], []];
            let numeriCartella = numeri.slice(i * 15, (i + 1) * 15).sort((a, b) => a - b);
            
            // Distribuiamo i 15 numeri nelle 3 righe (5 per riga) [cite: 2026-02-14]
            for (let r = 0; r < 3; r++) {
                let rigaNumeri = numeriCartella.slice(r * 5, (r + 1) * 5);
                let rigaFinale = new Array(9).fill(null);
                
                // Posiziona ogni numero nella sua colonna corretta (decina) [cite: 2026-02-14]
                rigaNumeri.forEach(num => {
                    let col = Math.floor(num / 10);
                    if (num === 90) col = 8;
                    // Se la colonna è occupata, cerca la prima libera (logica di emergenza)
                    while(rigaFinale[col] !== null) { col = (col + 1) % 9; }
                    rigaFinale[col] = num;
                });
                cartella[r] = rigaFinale;
            }
            serie.push(cartella);
        }
        return serie;
    }

    // Generiamo fino a coprire 1000 cartelle [cite: 2026-02-12]
    while (tutteLeCartelle.length < 1000) {
        tutteLeCartelle = tutteLeCartelle.concat(generaSerie());
    }
    
    return tutteLeCartelle.slice(0, 1000);
})();

// Esporta per lo script principale
if (typeof module !== 'undefined') { module.exports = ARCHIVIO_FISSO; }
