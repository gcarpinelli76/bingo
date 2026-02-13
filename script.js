/ Recupero dati salvati o inizializzazione se vuoti [cite: 2026-01-29]
var numeriUsciti = JSON.parse(localStorage.getItem('bingo_estratti')) || [];
var giocatori = JSON.parse(localStorage.getItem('bingo_giocatori')) || [];
var cartelleUsate = JSON.parse(localStorage.getItem('bingo_usate')) || [];
var selezioniAttuali = [];

window.onload = function() {
    var tabellone = document.getElementById('tabellone');
    if (tabellone) {
        tabellone.innerHTML = "";
        for (var i = 1; i <= 90; i++) {
            var div = document.createElement('div');
            div.className = 'numero'; 
            div.id = 'n' + i; 
            div.innerText = i;
            // Ripristina lo stato grafico se il numero era già estratto [cite: 2026-02-12]
            if (numeriUsciti.includes(i)) {
                div.className = 'numero estratto';
            }
            tabellone.appendChild(div);
        }
        // Ripristina l'ultimo numero gigante visualizzato
        if (numeriUsciti.length > 0) {
            document.getElementById('numero-gigante').innerText = numeriUsciti[numeriUsciti.length - 1];
        }
    }
    
    if (typeof ARCHIVIO_FISSO !== 'undefined' && ARCHIVIO_FISSO.length > 0) {
        disegnaSelettore();
    }
    aggiornaLista(); // Mostra sempre le vendite effettuate
};

function disegnaSelettore() {
    var griglia = document.getElementById('griglia-selezione');
    if (!griglia) return;
    griglia.innerHTML = "";
    
    for (var i = 0; i < ARCHIVIO_FISSO.length; i++) {
        var num = i + 1;
        var btn = document.createElement('button');
        btn.innerText = num;
        var classe = 'btn-selezione';
        if (cartelleUsate.includes(num)) classe += ' occupato'; 
        else if (selezioniAttuali.includes(num)) classe += ' selezionato';
        btn.className = classe;
        
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

    // Salvataggio permanente delle vendite [cite: 2026-01-29]
    localStorage.setItem('bingo_giocatori', JSON.stringify(giocatori));
    localStorage.setItem('bingo_usate', JSON.stringify(cartelleUsate));

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
    
    // Salvataggio immediato dell'estrazione [cite: 2026-02-12]
    localStorage.setItem('bingo_estratti', JSON.stringify(numeriUsciti));
    
    var el = document.getElementById('n' + n);
    if (el) el.className = 'numero estratto';
    document.getElementById('numero-gigante').innerText = n;
    aggiornaLista();
}

// Reset completo (Tabellone e Vendite) [cite: 2026-02-13]
function resetPartita() {
    if (confirm("Vuoi resettare TUTTO (estrazioni e vendite)?")) {
        localStorage.clear();
        numeriUsciti = [];
        giocatori = [];
        cartelleUsate = [];
        location.reload(); 
    }
}

// Reset solo Vendite (per liberare le cartelle senza resettare il tabellone)
function resetVendite() {
    if (confirm("Vuoi resettare solo l'elenco delle vendite?")) {
        localStorage.removeItem('bingo_giocatori');
        localStorage.removeItem('bingo_usate');
        giocatori = [];
        cartelleUsate = [];
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
