$(document).ready(function() {

    //setto la libreria moment in italiano
    moment.locale("it");
    //url_api
    var url_api = "http://157.230.17.132:4029/sales";
    //effettuo la chiamata ajax per recuperare la lista delle vendite
    $.ajax({
        "url": url_api,
        "method": "GET",
        "success": function(data) {
            //gestisco i dati per ottenere il fatturato mensile
            vendite_mensili(data);
            //gestisco i dati per ottenere le vendite per persona
            vendite_persona(data);
        },
        "error": function() {
            alert("Si è verificato un errore");
        }
    })

    function vendite_mensili(data)  {
        //creo una variabile dove inserire l'ammontare delle vendite di ogni mese
        var vendite_mensili = {
            "gennaio" : 0,
            "febbraio": 0,
            "marzo": 0,
            "aprile": 0,
            "maggio": 0,
            "giugno": 0,
            "luglio" : 0,
            "agosto": 0,
            "settembre": 0,
            "ottobre": 0,
            "novembre": 0,
            "dicembre": 0
        };

        //creo un ciclo for per aggiungere i valori alle chiavi dell'oggetto
        for (var i = 0; i < data.length; i++) {
            //creo una variabile con la vendita corrente
            var vendita_corrente = data[i];
            //creo una variabile con l'ammontare della vendita corrente
            var ammontare_corrente = vendita_corrente.amount;
            //converto il mese da numerico a testuale
            var mese_corrente = ottieni_mese_testuale(vendita_corrente.date);
            //aggiungo i valori alle chiavi dell'oggetto
            vendite_mensili[mese_corrente] += ammontare_corrente;
        }

        //creo una variabile con le chiavi dell'oggetto
        var chiaveMesi = Object.keys(vendite_mensili);
        //faccio lo stesso per ottenere i valori
        var valoreAmount = Object.values(vendite_mensili);

        //setto il grafico
        setLineChart(chiaveMesi,valoreAmount);
    }

    function ottieni_mese_testuale(mese) {
        var mese_testuale = moment(mese, "DD/M/YYYY").format("MMMM");
        return mese_testuale;
    }

    function setLineChart(mesi,amount) {
        //seleziono l'elemento in pagina
        var ctx = $('#chart-line')[0].getContext('2d');

        //vado a settare il grafico
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mesi,
                datasets: [{
                    data: amount,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    pointBackgroundColor: "green",
                    lineTension: 0,
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Numero delle vendite totali mese per mese nel 2017'
                },
                legend: {
                    display: false,
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        })
    }

    function vendite_persona(data) {
        //creo un oggetto contenente le vendite per persona
        var vendite_persona = {};
        var ammontare_totale = 0;

        //creo un ciclo for per ottenere la lista delle vendite
        for (var i = 0; i < data.length; i++) {
            var vendita_corrente = data[i];
            var venditore_corrente = vendita_corrente.salesman;
            var ammontare_corrente = vendita_corrente.amount;

            //aggiungo l'ammontare corrente a quello totale
            ammontare_totale += ammontare_corrente;
            //creo una condizione per aggiungere le chiavi e valori nell'oggetto
            if (!vendite_persona.hasOwnProperty(venditore_corrente)) {
                //se non ancora esiste la chiave l'aggiungo con il valore corrente
                vendite_persona[venditore_corrente] = ammontare_corrente;
            } else {
                //altrimenti leggo la chiave e gli sommo l'ammontare corrente
                vendite_persona[venditore_corrente] += ammontare_corrente;
            }
        }

        //creo un ciclo for in per sovrascrivere i valori dell'oggetto in valori percentuali
        for (var key in vendite_persona) {
            //trasformo il valore in percentuale
            var vendita_percentuale = (vendite_persona[key] / ammontare_totale * 100).toFixed(2);
            //sovrascrivo il valore dell'oggetto
            vendite_persona[key] = vendita_percentuale;
        }

        //recupero la chiave dell'oggetto
        var persona_venditore = Object.keys(vendite_persona);
        var ammontare_persona = Object.values(vendite_persona);
        //setto il grafico a torta
        setPieChart(persona_venditore, ammontare_persona)
    }

    function setPieChart(persona, amount) {
        //seleziono l'elemento in pagina
        var ctx = $('#chart-pie')[0].getContext('2d');

        //vado a settare il grafico
        var myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: persona,
                datasets: [{
                    data: amount,
                    backgroundColor: ["red", "green", "yellow","orange"],
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Numero delle vendite divise per venditore'
                },
                legend: {
                    position: "left",
                }
            }
        })
    }
})
