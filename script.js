var numeriUsciti = [];
var giocatori = [];
var selezioniAttuali = [];
var cartelleUsate = [];
var archivioCartelle = JSON.parse(localStorage.getItem('archivioBingo1000')) || [];

window.onload = function() {
    var tabellone = document.getElementById('tabellone');
    if (tabellone) {
        tabellone.innerHTML = "";
        for (var i = 1; i <= 90; i++) {
            var div = document.createElement('div');
            div.className = 'numero'; div.id = 'n' + i; div.innerText = i;
            tabellone.appendChild(div);
        }
    }
    if (archivioCartelle.length > 0) disegnaSelettore();
};

function generaSerie90() {
    var serie = [];
    var pool = Array.from({length: 90}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    for (var k = 0; k < 6; k++) serie.push(Array.from({length: 3}, () => Array(9).fill(null)));
    pool.forEach(n => {
        var col = n === 90 ? 8 : Math.floor(n / 10);
        var inserito = false;
        for (var t = 0; t < 200 && !inserito; t++) {
            var cIdx = Math.floor(Math.random() * 6), rIdx = Math.floor(Math.random() * 3);
            if (serie[cIdx][rIdx][col] === null && serie[cIdx][rIdx].filter(x => x !== null).length < 5) {
                serie[cIdx][rIdx][col] = n; inserito = true;
            }
        }
    });
    return serie;
}

function generaArchivioMille() {
    if (archivioCartelle.length >= 1000 && !confirm("Resettare l'archivio?")) return disegnaSelettore();
    archivioCartelle = [];
    for (var s = 0; s < 167; s++) archivioCartelle = archivioCartelle.concat(generaSerie90());
    archivioCartelle = archivioCartelle.slice(0, 1000);
    localStorage.setItem('archivioBingo1000', JSON.stringify(archivioCartelle));
    disegnaSelettore();
}

function disegnaSelettore() {
    var griglia = document.getElementById('griglia-selezione');
    if (!griglia) return;
    griglia.innerHTML = "";
    for (var i = 0; i < archivioCartelle.length; i++) {
        var num = i + 1;
        var btn = document.createElement('button');
        btn.innerText = num;
        btn.className = 'btn-selezione' + (cartelleUsate.includes(num) ? ' occupato' : (selezioniAttuali.includes(num) ? ' selezionato' : ''));
        btn.onclick = (function(n) { return function() {
            if (cartelleUsate.includes(n)) return;
            var idx = selezioniAttuali.indexOf(n);
            if (idx === -1) selezioniAttuali.push(n); else selezioniAttuali.splice(idx, 1);
            document.getElementById('cartella-corrente').innerText = selezioniAttuali.length > 0 ? selezioniAttuali.join(", ") : "---";
            disegnaSelettore();
        }; })(num);
        griglia.appendChild(btn);
    }
}

// INVIO UNICO LINK CON TUTTE LE CARTELLE [cite: 2026-02-12]
function assegnaCartellaDaArchivio() {
    var nome = document.getElementById('nome-giocatore').value;
    var tel = document.getElementById('tel-giocatore').value;
    if (selezioniAttuali.length === 0 || nome === "" || tel === "") return alert("Dati incompleti!");
    
    var baseUrl = window.location.href.split('vendita.html')[0];
    var pacchettoDati = [];

    selezioniAttuali.forEach((idS) => {
        pacchettoDati.push({ id: idS, numeri: archivioCartelle[idS - 1] });
        giocatori.push({ nome: nome, tel: tel, cartella: archivioCartelle[idS - 1], id: idS });
        cartelleUsate.push(idS);
    });

    var datiString = encodeURIComponent(JSON.stringify(pacchettoDati));
    var linkUnico = baseUrl + "cartella.html?data=" + datiString;
    var msg = "BINGO DIGITALE\nCiao " + nome.toUpperCase() + "!\n🎫 Hai " + selezioniAttuali.length + " cartelle.\n🔗 Clicca qui per vederle tutte:\n" + linkUnico;

    window.open("https://api.whatsapp.com/send?phone=" + tel + "&text=" + encodeURIComponent(msg), '_blank');

    selezioniAttuali = [];
    document.getElementById('cartella-corrente').innerText = "---";
    document.getElementById('nome-giocatore').value = "";
    document.getElementById('tel-giocatore').value = "";
    disegnaSelettore(); 
    aggiornaLista();
}

function estraiNumero() {
    if (numeriUsciti.length >= 90) return;
    var n;
    do { n = Math.floor(Math.random() * 90) + 1; } while (numeriUsciti.includes(n));
    numeriUsciti.push(n);
    var el = document.getElementById('n' + n);
    if (el) el.className = 'numero estratto';
    document.getElementById('numero-gigante').innerText = n;
    aggiornaLista();
}

function resetPartita() {
    if (confirm("Nuova Partita?")) {
        numeriUsciti = [];
        document.getElementById('numero-gigante').innerText = "--";
        for (var i = 1; i <= 90; i++) {
            var el = document.getElementById('n' + i);
            if (el) el.className = 'numero';
        }
        aggiornaLista();
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
