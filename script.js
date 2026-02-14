// 1. CONFIGURAZIONE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAMLbvGWyNxMa-CUKq7-SjJJ8tWOPg4xWQ",
  authDomain: "bingolive-33748.firebaseapp.com",
  databaseURL: "https://bingolive-33748-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "bingolive-33748",
  storageBucket: "bingolive-33748.firebasestorage.app",
  messagingSenderId: "808361788552",
  appId: "1:808361788552:web:402b229f6395bc26a28b3d"
};

// Inizializzazione protetta
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const db = firebase.database();

// 2. VARIABILI DI STATO ORIGINALI
var numeriUsciti = [];
var giocatori = [];
var cartelleUsate = [];
var premiVinti = { quaterna: false, cinquina: false, bingo: false };
var selezioniAttuali = [];

// 3. CARICAMENTO E DISEGNO
window.onload = function() {
    // Disegno immediato del tabellone vuoto per evitare lo schermo bianco
    var tabellone = document.getElementById('tabellone');
    if (tabellone) {
        tabellone.innerHTML = "";
        for (var i = 1; i <= 90; i++) {
            var div = document.createElement('div');
            div.className = 'numero';
            div.id = 'n' + i;
            div.innerText = i;
            tabellone.appendChild(div);
        }
    }

    // Ascolto dei dati dal Cloud
    db.ref('bingo/').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        numeriUsciti = data.estratti || [];
        giocatori = data.giocatori || [];
        cartelleUsate = data.usate || [];
        premiVinti = data.premi || { quaterna: false, cinquina: false, bingo: false };
        
        aggiornaTutto();
    });
};

function aggiornaTutto() {
    // Aggiorna colori tabellone
    for (var i = 1; i <= 90; i++) {
        var el = document.getElementById('n' + i);
        if (el) {
            el.className = numeriUsciti.includes(i) ? 'numero estratto' : 'numero';
        }
    }
    
    // Numero gigante
    var disp = document.getElementById('numero-gigante');
    if (disp) {
        disp.innerText = numeriUsciti.length > 0 ? numeriUsciti[numeriUsciti.length - 1] : "--";
    }
    
    // Selettore cartelle vendita
    if (typeof ARCHIVIO_FISSO !== 'undefined') {
        disegnaSelettore();
    }
    
    // Lista giocatori e mini-cartelle
    aggiornaLista();
}

// 4. LOGICA VENDITA (Archivio 1000 cartelle)
function disegnaSelettore() {
    var griglia = document.getElementById('griglia-selezione');
    if (!griglia) return;
    griglia.innerHTML = "";
    for (var i = 0; i < ARCHIVIO_FISSO.length; i++) {
        var num = i + 1;
        var btn = document.createElement('button');
        btn.innerText = num;
        
        var isOccupato = cartelleUsate.includes(num);
        var isSelezionato = selezioniAttuali.includes(num);
        
        btn.className = 'btn-selezione';
        if (isOccupato) btn.classList.add('occupato');
        if (isSelezionato) btn.classList.add('selezionato');
        
        btn.onclick = (function(n) {
            return function() {
                if (cartelleUsate.includes(n)) return;
                var idx = selezioniAttuali.indexOf(n);
                if (idx === -1) {
                    selezioniAttuali.push(n);
                } else {
                    selezioniAttuali.splice(idx, 1);
                }
                var curr = document.getElementById('cartella-corrente');
                if (curr) curr.innerText = selezioniAttuali.length > 0 ? selezioniAttuali.join(", ") : "---";
                disegnaSelettore();
            };
        })(num);
        griglia.appendChild(btn);
    }
}

function assegnaCartellaDaArchivio() {
    var nomeIn = document.getElementById('nome-giocatore');
    var telIn = document.getElementById('tel-giocatore');
    
    if (!nomeIn || !telIn || selezioniAttuali.length === 0 || nomeIn.value === "" || telIn.value === "") {
        return alert("Inserisci nome, telefono e seleziona almeno una cartella!");
    }

    selezioniAttuali.forEach((idS) => {
        giocatori.push({
            nome: nomeIn.value,
            tel: telIn.value,
            cartella: ARCHIVIO_FISSO[idS - 1],
            id: idS
        });
        cartelleUsate.push(idS);
    });

    // Sincronizza con Cloud
    db.ref('bingo/').update({
        giocatori: giocatori,
        usate: cartelleUsate
    });

    // Link WhatsApp
    var baseUrl = window.location.href.split('vendita.html')[0];
    var linkUnico = baseUrl + "cartella.html?ids=" + selezioniAttuali.join(',');
    var msg = "Ciao " + nomeIn.value.toUpperCase() + ", ecco le tue cartelle: " + linkUnico;
    window.open("https://api.whatsapp.com/send?phone=" + telIn.value + "&text=" + encodeURIComponent(msg), '_blank');

    // Reset locale
    selezioniAttuali = [];
    nomeIn.value = "";
    telIn.value = "";
}

// 5. LOGICA GIOCO
function estraiNumero() {
    if (numeriUsciti.length >= 90) return;
    var n;
    do {
        n = Math.floor(Math.random() * 90) + 1;
    } while (numeriUsciti.includes(n));
    
    numeriUsciti.push(n);
    db.ref('bingo/').update({ estratti: numeriUsciti });
    controllaVincite();
}

function controllaVincite() {
    giocatori.forEach(g => {
        let puntiTotali = 0;
        for (let r = 0; r < 3; r++) {
            let rigaPunti = 0;
            for (let c = 0; c < 9; c++) {
                let n = g.cartella[r][c];
                if (n && numeriUsciti.includes(n)) {
                    rigaPunti++;
                    puntiTotali++;
                }
            }
            if (rigaPunti === 4 && !premiVinti.quaterna) {
                annunciaVincitore("QUATERNA", g.nome, g.id);
                premiVinti.quaterna = true;
            }
            if (rigaPunti === 5 && !premiVinti.cinquina) {
                annunciaVincitore("CINQUINA", g.nome, g.id);
                premiVinti.cinquina = true;
            }
        }
        if (puntiTotali === 15 && !premiVinti.bingo) {
            annunciaVincitore("BINGO", g.nome, g.id);
            premiVinti.bingo = true;
        }
    });
    db.ref('bingo/').update({ premi: premiVinti });
}

function annunciaVincitore(tipo, nome, id) {
    let div = document.createElement('div');
    div.className = "overlay-vittoria";
    div.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;text-align:center;";
    div.innerHTML = <h1>${tipo}!</h1><h2>${nome.toUpperCase()}</h2><p>Cartella n. ${id}</p><button onclick="this.parentElement.remove()" style="padding:10px 20px; font-size:20px;">OK</button>;
    document.body.appendChild(div);
}

function aggiornaLista() {
    var lista = document.getElementById('lista-classifica');
    if (!lista) return;
    lista.innerHTML = "";
    giocatori.slice().reverse().forEach(g => {
        var d = document.createElement('div');
        d.className = "giocatore-item";
        d.innerHTML = <strong>${g.nome}</strong> (Cartella ${g.id});
        // Qui potresti aggiungere la visualizzazione della mini-cartella se presente nel CSS
        lista.appendChild(d);
    });
}

function resetPartita() {
    if(confirm("Vuoi resettare i numeri estratti?")) {
        db.ref('bingo/estratti').remove();
        db.ref('bingo/premi').set({ quaterna: false, cinquina: false, bingo: false });
    }
}

function resetVendite() {
    if(confirm("ATTENZIONE: Questo cancellerà tutti i giocatori e le vendite!")) {
        db.ref('bingo/').remove();
    }
}
