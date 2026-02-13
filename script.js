// Recupero sicuro dei dati o inizializzazione array vuoti
var numeriUsciti = JSON.parse(localStorage.getItem('bingo_estratti')) || [];
var giocatori = JSON.parse(localStorage.getItem('bingo_giocatori')) || [];
var cartelleUsate = JSON.parse(localStorage.getItem('bingo_usate')) || [];
var selezioniAttuali = [];

window.onload = function() {
    // 1. Inizializzazione Tabellone (se presente nella pagina)
    var tabellone = document.getElementById('tabellone');
    if (tabellone) {
        tabellone.innerHTML = "";
        for (var i = 1; i <= 90; i++) {
            var div = document.createElement('div');
            div.className = numeriUsciti.includes(i) ? 'numero estratto' : 'numero';
            div.id = 'n' + i;
            div.innerText = i;
            tabellone.appendChild(div);
        }
        // Ripristina l'ultimo numero estratto nel box gigante
        if (numeriUsciti.length > 0) {
            var ultimo = numeriUsciti[numeriUsciti.length - 1];
            var display = document.getElementById('numero-gigante');
            if (display) display.innerText = ultimo;
        }
    }
    
    // 2. Inizializzazione Griglia Vendita (se presente nella pagina)
    // Controlla che ARCHIVIO_FISSO (da dati.js) sia caricato
    if (typeof ARCHIVIO_FISSO !== 'undefined') {
        disegnaSelettore();
    }
    
    // 3. Aggiorna sempre la lista delle vendite effettuate
    aggiornaLista();
};

function disegnaSelettore() {
    var griglia = document.getElementById('griglia-selezione');
    if (!griglia) return;
    griglia.innerHTML = "";
    
    // Usiamo l'archivio fisso da 1000 cartelle
    for (var i = 0; i < ARCHIVIO_FISSO.length; i++) {
        var num = i + 1;
        var btn = document.createElement('button');
        btn.innerText = num;
        
        var classe = 'btn-selezione';
        if (cartelleUsate.includes(num)) classe += ' occupato'; 
        else if (selezioniAttuali.includes(num)) classe += ' selezionato';
        btn.className = classe;
        
        btn.onclick = (function(n) { 
            return function() {
                if (cartelleUsate.includes(n)) return;
                var idx = selezioniAttuali.indexOf(n);
                if (idx === -1) selezioniAttuali.push(n); 
                else selezioniAttuali.splice(idx, 1);
                
                var displaySelezionate = document.getElementById('cartella-corrente');
                if (displaySelezionate) {
                    displaySelezionate.innerText = selezioniAttuali.length > 0 ? selezioniAttuali.join(", ") : "---";
                }
                disegnaSelettore();
            }; 
        })(num);
        griglia.appendChild(btn);
    }
}

function assegnaCartellaDaArchivio() {
    var nomeInput = document.getElementById('nome-giocatore');
    var telInput = document.getElementById('tel-giocatore');
    if (!nomeInput || !telInput) return;

    var nome = nomeInput.value;
    var tel = telInput.value;
    
    if (selezioniAttuali.length === 0 || nome === "" || tel === "") return alert("Dati incompleti!");
    
    var baseUrl = window.location.href.split('vendita.html')[0];
    var idsString = selezioniAttuali.join(',');

    selezioniAttuali.forEach((idS) => {
        giocatori.push({ nome: nome, tel: tel, cartella: ARCHIVIO_FISSO[idS - 1], id: idS });
        cartelleUsate.push(idS);
    });

    // Salvataggio permanente
    localStorage.setItem('bingo_giocatori', JSON.stringify(giocatori));
    localStorage.setItem('bingo_usate', JSON.stringify(cartelleUsate));

    var linkUnico = baseUrl + "cartella.html?ids=" + idsString;
    var msg = "BINGO\nCliente: " + nome.toUpperCase() + "\n🎫 Cartelle: " + idsString + "\n🔗 Link unico:\n" + linkUnico;

    window.open("https://api.whatsapp.com/send?phone=" + tel + "&text=" + encodeURIComponent(msg), '_blank');

    selezioniAttuali = [];
    document.getElementById('cartella-corrente').innerText = "---";
    nomeInput.value = "";
    telInput.value = "";
    disegnaSelettore(); 
    aggiornaLista();
}

function estraiNumero() {
    if (numeriUsciti.length >= 90) return;
    var n;
    do { n = Math.floor(Math.random() * 90) + 1; } while (numeriUsciti.includes(n));
    numeriUsciti.push(n);
    
    localStorage.setItem('bingo_estratti', JSON.stringify(numeriUsciti));
    
    var el = document.getElementById('n' + n);
    if (el) el.className = 'numero estratto';
    
    var display = document.getElementById('numero-gigante');
    if (display) display.innerText = n;
    
    aggiornaLista();
}

function resetPartita() {
    if (confirm("Vuoi resettare TUTTO (estrazioni e vendite)?")) {
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
