// Recupero dati o inizializzazione [cite: 2026-01-29]
var numeriUsciti = JSON.parse(localStorage.getItem('bingo_estratti')) || [];
var giocatori = JSON.parse(localStorage.getItem('bingo_giocatori')) || [];
var cartelleUsate = JSON.parse(localStorage.getItem('bingo_usate')) || [];
var premiVinti = JSON.parse(localStorage.getItem('bingo_premi')) || { quaterna: false, cinquina: false, bingo: false };
var selezioniAttuali = [];

window.onload = function() {
    var tabellone = document.getElementById('tabellone');
    if (tabellone) {
        tabellone.innerHTML = "";
        for (var i = 1; i <= 90; i++) {
            var div = document.createElement('div');
            div.className = numeriUsciti.includes(i) ? 'numero estratto' : 'numero';
            div.id = 'n' + i; div.innerText = i;
            tabellone.appendChild(div);
        }
        if (numeriUsciti.length > 0) {
            var display = document.getElementById('numero-gigante');
            if (display) display.innerText = numeriUsciti[numeriUsciti.length - 1];
        }
    }
    if (typeof ARCHIVIO_FISSO !== 'undefined') disegnaSelettore();
    aggiornaLista();
};

function disegnaSelettore() {
    var griglia = document.getElementById('griglia-selezione');
    if (!griglia) return;
    griglia.innerHTML = "";
    for (var i = 0; i < ARCHIVIO_FISSO.length; i++) {
        var num = i + 1;
        var btn = document.createElement('button');
        btn.innerText = num;
        var classe = 'btn-selezione' + (cartelleUsate.includes(num) ? ' occupato' : (selezioniAttuali.includes(num) ? ' selezionato' : ''));
        btn.className = classe;
        btn.onclick = (function(n) { return function() {
            if (cartelleUsate.includes(n)) return;
            var idx = selezioniAttuali.indexOf(n);
            if (idx === -1) selezioniAttuali.push(n); else selezioniAttuali.splice(idx, 1);
            var curr = document.getElementById('cartella-corrente');
            if (curr) curr.innerText = selezioniAttuali.length > 0 ? selezioniAttuali.join(", ") : "---";
            disegnaSelettore();
        }; })(num);
        griglia.appendChild(btn);
    }
}

function assegnaCartellaDaArchivio() {
    var nomeIn = document.getElementById('nome-giocatore');
    var telIn = document.getElementById('tel-giocatore');
    if (!nomeIn || !telIn) return;
    var nome = nomeIn.value; var tel = telIn.value;
    if (selezioniAttuali.length === 0 || nome === "" || tel === "") return alert("Dati incompleti!");
    
    var baseUrl = window.location.href.split('vendita.html')[0];
    var idsString = selezioniAttuali.join(',');

    selezioniAttuali.forEach((idS) => {
        giocatori.push({ nome: nome, tel: tel, cartella: ARCHIVIO_FISSO[idS - 1], id: idS });
        cartelleUsate.push(idS);
    });

    localStorage.setItem('bingo_giocatori', JSON.stringify(giocatori));
    localStorage.setItem('bingo_usate', JSON.stringify(cartelleUsate));

    var linkUnico = baseUrl + "cartella.html?ids=" + idsString;
    var msg = "BINGO\nCliente: " + nome.toUpperCase() + "\n🎫 Cartelle: " + idsString + "\n🔗 Link unico:\n" + linkUnico;
    window.open("https://api.whatsapp.com/send?phone=" + tel + "&text=" + encodeURIComponent(msg), '_blank');

    selezioniAttuali = [];
    document.getElementById('cartella-corrente').innerText = "---";
    nomeIn.value = ""; telIn.value = "";
    disegnaSelettore(); aggiornaLista();
}

function estraiNumero() {
    if (numeriUsciti.length >= 90) return;
    var n; do { n = Math.floor(Math.random() * 90) + 1; } while (numeriUsciti.includes(n));
    numeriUsciti.push(n);
    localStorage.setItem('bingo_estratti', JSON.stringify(numeriUsciti));
    var el = document.getElementById('n' + n);
    if (el) el.className = 'numero estratto';
    var display = document.getElementById('numero-gigante');
    if (display) display.innerText = n;
    
    controllaVincite();
    aggiornaLista();
}

function controllaVincite() {
    giocatori.forEach(g => {
        let numeriTotaliCartella = 0;
        for (let r = 0; r < 3; r++) {
            let numeriInRiga = 0;
            for (let c = 0; c < 9; c++) {
                let num = g.cartella[r][c];
                if (num !== null && numeriUsciti.includes(num)) {
                    numeriInRiga++;
                    numeriTotaliCartella++;
                }
            }
            if (numeriInRiga === 4 && !premiVinti.quaterna) {
                annunciaVincitore("QUATERNA", g.nome, g.id);
                premiVinti.quaterna = true;
            }
            if (numeriInRiga === 5 && !premiVinti.cinquina) {
                annunciaVincitore("CINQUINA", g.nome, g.id);
                premiVinti.cinquina = true;
            }
        }
        if (numeriTotaliCartella === 15 && !premiVinti.bingo) {
            annunciaVincitore("BINGO", g.nome, g.id);
            premiVinti.bingo = true;
        }
    });
    localStorage.setItem('bingo_premi', JSON.stringify(premiVinti));
}

function annunciaVincitore(tipo, nome, cartellaId) {
    let overlay = document.createElement('div');
    // Stile compatto: ridotti i margini e le dimensioni per alzare il tasto [cite: 2026-02-13]
    overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:10000; color:white; font-family:sans-serif; text-align:center; border: 10px solid #f1c40f; box-sizing:border-box; padding:10px;";
    
    let titolo = tipo === "BINGO" ? "🎉 BINGO! 🎉" : "🏆 " + tipo;
    overlay.innerHTML = `
        <h1 style="font-size:9vw; margin:5px 0; color:#f1c40f;">${titolo}</h1>
        <p style="font-size:5vw; margin:5px 0;">Vincitore: <br><strong>${nome.toUpperCase()}</strong></p>
        <p style="font-size:3.5vw; color:#bdc3c7; margin:5px 0;">Cartella N. ${cartellaId}</p>
        <button onclick="this.parentElement.remove()" style="padding:10px 35px; font-size:4vw; cursor:pointer; background:#f1c40f; border:none; border-radius:10px; margin-top:15px; font-weight:bold; color:black; text-transform:uppercase;">Chiudi</button>
    `;
    document.body.appendChild(overlay);
}
}

// RESET SOLO TABELLONE: Mantiene i giocatori e le loro cartelle [cite: 2026-02-13]
function resetPartita() {
    if (confirm("Vuoi resettare i numeri estratti? Le cartelle assegnate rimarranno ai clienti.")) {
        localStorage.removeItem('bingo_estratti');
        localStorage.removeItem('bingo_premi');
        numeriUsciti = [];
        premiVinti = { quaterna: false, cinquina: false, bingo: false };
        location.reload(); 
    }
}

// RESET TOTALE: Libera anche le cartelle vendute [cite: 2026-02-13]
function resetVendite() {
    if (confirm("Attenzione: vuoi liberare tutte le cartelle e cancellare l'elenco dei giocatori?")) {
        localStorage.clear();
        location.reload(); 
    }
}

function aggiornaLista() {
    var lista = document.getElementById('lista-classifica');
    if (!lista) return;
    lista.innerHTML = "";
    giocatori.slice().reverse().forEach(g => {
        var d = document.createElement('div');
        d.innerHTML = "<strong>👤 " + g.nome + "</strong> (C. " + g.id + ")";
        var html = '<div class="cartella-mini">';
        for (var r = 0; r < 3; r++) {
            for (var c = 0; c < 9; c++) {
                var n = g.cartella[r][c];
                var estr = (n !== null && numeriUsciti.includes(n)) ? ' estratto-mini' : '';
                html += n === null ? '<div class="cella-mini cella-vuota"></div>' : '<div class="cella-mini' + estr + '">' + n + '</div>';
            }
        }
        d.innerHTML += html + '</div>';
        lista.appendChild(d);
    });
}

