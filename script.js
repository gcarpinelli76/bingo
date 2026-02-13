var tabellone = document.getElementById('tabellone');
var numeriUsciti = [];
var giocatori = [];
var selezioniAttuali = [];
var cartelleUsate = [];

// Recupero archivio fisso di 1000 cartelle
var archivioCartelle = JSON.parse(localStorage.getItem('archivioBingo1000')) || [];

if (tabellone) {
    tabellone.innerHTML = "";
    for (var i = 1; i <= 90; i++) {
        var div = document.createElement('div');
        div.className = 'numero'; div.id = 'n' + i; div.innerText = i;
        tabellone.appendChild(div);
    }
}

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
    if (archivioCartelle.length >= 1000) return disegnaSelettore();
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

    selezioniAttuali.forEach(idS => {
        var datiCartella = archivioCartelle[idS - 1];
        var datiString = encodeURIComponent(JSON.stringify(datiCartella));
        // Il link ora trasporta i dati per il telefono
        var link = baseUrl + "cartella.html?id=" + idS + "&data=" + datiString;
        
        var msg = "BINGO DIGITALE\nCliente: " + nome.toUpperCase() + "\n🎫 Cartella N. " + idS + "\n🔗 Link:
