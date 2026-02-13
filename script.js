var numeriUsciti = [];
var giocatori = [];
var selezioniAttuali = [];
var cartelleUsate = [];

function inizializzaTutto() {
    var tabellone = document.getElementById('tabellone');
    if (tabellone) {
        tabellone.innerHTML = "";
        for (var i = 1; i <= 90; i++) {
            var div = document.createElement('div');
            div.className = 'numero'; div.id = 'n' + i; div.innerText = i;
            tabellone.appendChild(div);
        }
    }
    disegnaSelettore();
}

window.onload = inizializzaTutto;

function disegnaSelettore() {
    var griglia = document.getElementById('griglia-selezione');
    if (!griglia) return;
    griglia.innerHTML = "";
    // Usiamo l'archivio fisso invece di quello casuale [cite: 2026-02-12]
    for (var i = 0; i < ARCHIVIO_FISSO.length; i++) {
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

function assegnaCartellaDaArchivio() {
    var nome = document.getElementById('nome-giocatore').value;
    var tel = document.getElementById('tel-giocatore').value;
    if (selezioniAttuali.length === 0 || nome === "" || tel === "") return alert("Dati incompleti!");
    
    var baseUrl = window.location.href.split('vendita.html')[0];
    var idsString = selezioniAttuali.join(',');

    selezioniAttuali.forEach((idS) => {
        giocatori.push({ nome: nome, tel: tel, cartella: ARCHIVIO_FISSO[idS - 1], id: idS });
        cartelleUsate.push(idS);
    });

    // Il link ora contiene solo i numeri delle cartelle (es: 1,2,3) [cite: 2026-02-12]
    var linkUnico = baseUrl + "cartella.html?ids=" + idsString;
    var msg = "BINGO\nCliente: " + nome.toUpperCase() + "\n🎫 Cartelle: " + idsString + "\n🔗 Link unico:\n" + linkUnico;

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
