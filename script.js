// Configurazione Cloud Gigi [cite: 2026-02-14]
const firebaseConfig = {
  apiKey: "AIzaSyAMLbvGWyNxMa-CUKq7-SjJJ8tWOPg4xWQ",
  authDomain: "bingolive-33748.firebaseapp.com",
  databaseURL: "https://bingolive-33748-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "bingolive-33748",
  storageBucket: "bingolive-33748.firebasestorage.app",
  messagingSenderId: "808361788552",
  appId: "1:808361788552:web:402b229f6395bc26a28b3d"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

var numeriUsciti = [], giocatori = [], cartelleUsate = [], selezioniAttuali = [];
var premiVinti = { quaterna: false, cinquina: false, bingo: false };

// --- FUNZIONI TABELLONE ORIGINALI --- [cite: 2026-01-29]
function inizializzaTabellone() {
    var tab = document.getElementById('tabellone');
    if (tab && tab.innerHTML === "") {
        for (var i = 1; i <= 90; i++) {
            var div = document.createElement('div');
            div.className = 'numero'; div.id = 'n' + i; div.innerText = i;
            tab.appendChild(div);
        }
    }
}

// --- SINCRONIZZAZIONE REALTIME --- [cite: 2026-02-14]
db.ref('bingo/').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    numeriUsciti = data.estratti || [];
    giocatori = data.giocatori || [];
    cartelleUsate = data.usate || [];
    premiVinti = data.premi || { quaterna: false, cinquina: false, bingo: false };

    inizializzaTabellone();
    aggiornaGraficaTabellone();
    disegnaSelettore();
    aggiornaLista();
});

function aggiornaGraficaTabellone() {
    for (var i = 1; i <= 90; i++) {
        var el = document.getElementById('n' + i);
        if (el) el.className = numeriUsciti.includes(i) ? 'numero estratto' : 'numero';
    }
    var display = document.getElementById('numero-gigante');
    if (display) display.innerText = numeriUsciti.length > 0 ? numeriUsciti[numeriUsciti.length - 1] : "--";
}

// --- GESTIONE CARTELLE (1000 FISSE) --- [cite: 2026-02-12]
function disegnaSelettore() {
    var griglia = document.getElementById('griglia-selezione');
    if (!griglia || typeof ARCHIVIO_FISSO === 'undefined') return;
    griglia.innerHTML = "";
    for (var i = 0; i < ARCHIVIO_FISSO.length; i++) {
        var num = i + 1;
        var btn = document.createElement('button');
        btn.innerText = num;
        btn.className = 'btn-selezione' + (cartelleUsate.includes(num) ? ' occupato' : (selezioniAttuali.includes(num) ? ' selezionato' : ''));
        btn.onclick = (function(n) { return function() {
            if (cartelleUsate.includes(n)) return;
            var idx = selezioniAttuali.indexOf(n);
            if (idx === -1) selezioniAttuali.push(n); else selezioniAttuali.splice(idx, 1);
            var display = document.getElementById('cartella-corrente');
            if (display) display.innerText = selezioniAttuali.length > 0 ? selezioniAttuali.join(", ") : "---";
            disegnaSelettore();
        }; })(num);
        griglia.appendChild(btn);
    }
}

// --- FUNZIONI GIOCO ORIGINALI --- [cite: 2026-01-29]
function estraiNumero() {
    if (numeriUsciti.length >= 90) return;
    var n; do { n = Math.floor(Math.random() * 90) + 1; } while (numeriUsciti.includes(n));
    numeriUsciti.push(n);
    db.ref('bingo/').update({ estratti: numeriUsciti });
    controllaVincite();
}

function controllaVincite() {
    giocatori.forEach(g => {
        let totCartella = 0;
        for (let r = 0; r < 3; r++) {
            let inRiga = 0;
            for (let c = 0; c < 9; c++) {
                if (g.cartella[r][c] && numeriUsciti.includes(g.cartella[r][c])) { inRiga++; totCartella++; }
            }
            if (inRiga === 4 && !premiVinti.quaterna) { annunciaVincitore("QUATERNA", g.nome, g.id); premiVinti.quaterna = true; }
            if (inRiga === 5 && !premiVinti.cinquina) { annunciaVincitore("CINQUINA", g.nome, g.id); premiVinti.cinquina = true; }
        }
        if (totCartella === 15 && !premiVinti.bingo) { annunciaVincitore("BINGO", g.nome, g.id); premiVinti.bingo = true; }
    });
    db.ref('bingo/').update({ premi: premiVinti });
}

// --- ANNUNCIO ORIGINALE (ALTO) --- [cite: 2026-02-13]
function annunciaVincitore(tipo, nome, cartellaId) {
    let overlay = document.createElement('div');
    overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:10000; color:white; text-align:center; border: 10px solid #f1c40f; box-sizing:border-box; padding:10px;";
    overlay.innerHTML = `
        <h1 style="font-size:9vw; margin:5px 0; color:#f1c40f;">${tipo === "BINGO" ? "🎉 BINGO! 🎉" : "🏆 " + tipo}</h1>
        <p style="font-size:5vw; margin:5px 0;">Vincitore: <br><strong>${nome.toUpperCase()}</strong></p>
        <p style="font-size:3.5vw; color:#bdc3c7; margin:5px 0;">Cartella N. ${cartellaId}</p>
        <button onclick="this.parentElement.remove()" style="padding:10px 35px; font-size:4vw; cursor:pointer; background:#f1c40f; border:none; border-radius:10px; margin-top:15px; font-weight:bold; color:black; text-transform:uppercase;">Chiudi</button>
    `;
    document.body.appendChild(overlay);
}

function assegnaCartellaDaArchivio() {
    var nomeIn = document.getElementById('nome-giocatore');
    var telIn = document.getElementById('tel-giocatore');
    if (!nomeIn || !telIn || selezioniAttuali.length === 0 || nomeIn.value === "" || telIn.value === "") return alert("Dati incompleti!");

    var baseUrl = window.location.href.split('vendita.html')[0];
    selezioniAttuali.forEach((idS) => {
        giocatori.push({ nome: nomeIn.value, tel: telIn.value, cartella: ARCHIVIO_FISSO[idS - 1], id: idS });
        cartelleUsate.push(idS);
    });

    db.ref('bingo/').update({ giocatori: giocatori, usate: cartelleUsate });

    var linkUnico = baseUrl + "cartella.html?ids=" + selezioniAttuali.join(',');
    var msg = "BINGO\nCliente: " + nomeIn.value.toUpperCase() + "\n🎫 Cartelle: " + selezioniAttuali.join(',') + "\n🔗 Link unico:\n" + linkUnico;
    window.open("https://api.whatsapp.com/send?phone=" + telIn.value + "&text=" + encodeURIComponent(msg), '_blank');

    selezioniAttuali = [];
    nomeIn.value = ""; telIn.value = "";
}

function aggiornaLista() {
    var lista = document.getElementById('lista-classifica');
    if (!lista) return; lista.innerHTML = "";
    giocatori.slice().reverse().forEach(g => {
        var d = document.createElement('div');
        d.style = "border-bottom: 1px solid #444; padding: 5px; margin-bottom: 5px;";
        d.innerHTML = <strong>👤 ${g.nome.toUpperCase()}</strong> (C. ${g.id});
        lista.appendChild(d);
    });
}

function resetPartita() { if (confirm("Resettare i numeri?")) db.ref('bingo/estratti').remove(); }
function resetVendite() { if (confirm("RIPRISTINO TOTALE: Libera le cartelle?")) db.ref('bingo/').remove(); }
