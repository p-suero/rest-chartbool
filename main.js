$(document).ready(function() {

    //effettuo la chiamata ajax per recuperare la lista delle vendite
    $.ajax({
        "url": "http://157.230.17.132:4029/sales",
        "method": "GET",
        "success": function(data) {
            console.log(data);

            //gestisco i dati per ottenere il fatturato mensile
            vendite_mensili(data)
        },
        "error": function() {
            alert("Si è verificato un errore")
        }
    })

    function vendite_mensili(data)  {
        //creo una variabile dove inserire l'ammontare delle vendite di ogni mese
        var vendite_mensili = {
            "January" : 0,
            "February": 0,
            "March": 0,
            "April": 0,
            "May": 0,
            "June": 0,
            "July" : 0,
            "August": 0,
            "September": 0,
            "October": 0,
            "November": 0,
            "December": 0
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
        setLineChart(chiaveMesi,valoreAmount)
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
                    pointBackgroundColor: "green"
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
})
