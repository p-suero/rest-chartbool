$(document).ready(function() {

    //setto la libreria moment in italiano
    moment.locale("it");

    //preparo la funzione di handlebars per le option dei venditori
    var template_option_mesi = $("#option-month-template").html();
    var template_function_mesi = Handlebars.compile(template_option_mesi);

    //preparo la funzione di handlebars per le option dei mesi
    var template_option_venditori = $("#option-sellers-template").html();
    var template_function_venditori = Handlebars.compile(template_option_venditori);

    //url_api
    var url_api = "http://157.230.17.132:4029/sales";

    //effettuo la chiamata ajax per disegnare i grafici indicando il parametro "aggiorna" == false
    disegna_grafici(false);

    //intercetto il click sul button "invia dati"
    $("#send-data").click(function() {
        var val_select_mesi = $("#month").val();
        var val_select_venditori = $("#sellers").val();
        var val_amount = $("#amount").val();

        //se i valori sono validi effettuo i settaggi per la chiamata POST
        if (val_select_mesi != "" && val_select_venditori != "" && val_amount != "") {
            //compongo una data generica, ma con il mese scelto dall'utente
            var data = "01/" + val_select_mesi + "/2017";
            //svuoto i valori delle select e dell'input
            $("#month").val("");
            $("#sellers").val("");
            $("#amount").val("");

            //effettuo la chiamata ajax con metodo Http "POST" per aggiungere un parametro all'API
            $.ajax({
                "url": url_api,
                "method": "POST",
                "data": {
                    "salesman": val_select_venditori,
                    "amount": val_amount,
                    "date" : data
                },
                "success": function() {
                    //effettuo una chiamata ajax con parametro "true" per aggiornare solamente i valori del grafico
                    disegna_grafici(true);
                },
                "error": function() {
                    alert("Si è verificato un errore");
                }
            })
        }
    })

    function disegna_grafici(aggiorna) {
        //effettuo la chiamata ajax per recuperare la lista delle vendite
        $.ajax({
            "url": url_api,
            "method": "GET",
            "success": function(data) {
                //gestisco i dati per ottenere il fatturato mensile
                vendite_mensili(data,aggiorna);
                //gestisco i dati per ottenere il fatturato per persona
                vendite_persona(data,aggiorna);
                //gestisco i dati per ottenere il fatturato diviso in quarter
                vendite_quarter(data,aggiorna)
            },
            "error": function() {
                alert("Si è verificato un errore");
            }
        })
    }

    function vendite_mensili(data,aggiorna)  {
        //creo una variabile dove inserire l'ammontare delle vendite di ogni mese
        var vendite_mensili = {};

        //creo un ciclo for per aggiungere i mesi all'oggetto vendite_mensili
        for (var i = 1; i <= 12; i++) {
            //converto la i in mese testuale
            var data_moment = moment(i , "M").format("MMMM");
            //aggiungo la prima lettera del mese in mauscolo
            var data_moment_upp = data_moment.charAt(0).toUpperCase() + data_moment.slice(1);
            vendite_mensili[data_moment_upp] = 0;
        }

        //creo un ciclo for per aggiungere i valori alle chiavi dell'oggetto vendite_mensili
        for (var i = 0; i < data.length; i++) {
            //creo una variabile con la vendita corrente
            var vendita_corrente = data[i];
            //creo una variabile con l'ammontare della vendita corrente
            var ammontare_corrente = parseFloat(vendita_corrente.amount);
            //creo una variabile dove inserire il mese convertito (con la libreria moment) da numerico a testuale
            var mese_corrente = moment(vendita_corrente.date, "DD/MM/YYYY").format("MMMM");
            //aggiungo la prima lettera del mese in mauscolo
            var mese_corrente_upp = mese_corrente.charAt(0).toUpperCase() + mese_corrente.slice(1);
            //aggiungo i valori alle chiavi dell'oggetto
            vendite_mensili[mese_corrente_upp] += ammontare_corrente;
        }
        //creo una variabile con le chiavi dell'oggetto
        var mesi = Object.keys(vendite_mensili);
        //faccio lo stesso per ottenere i valori
        var ammontare_mese = Object.values(vendite_mensili);
        //popolo la select dei venditori
        popola_select_mesi(mesi);

        //se la variabile aggiorna è uguale a "false" setto il grafico per la prima volta
        if (aggiorna == false) {
            //aggiungo i dati nel grafico per la prima volta
            imposta_grafico_mesi(mesi,ammontare_mese);
        } else {
            //altrimenti lo aggiorno semplicemente
            //vado a selezionare il data e lo pongo uguale all'array aggiornato
            grafico_mesi.config.data.datasets[0].data = ammontare_mese;
            //uso la seguente funzione per aggiornare i dati nel grafico
            grafico_mesi.update();
        }
    }

    function imposta_grafico_mesi(mesi,amount) {
        //vado a settare il grafico
        grafico_mesi = new Chart($('#chart-mese')[0].getContext('2d'), {
            type: 'line',
            data: {
                labels: mesi,
                datasets: [{
                    data: amount,
                    label: "importi vendite",
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    pointBackgroundColor: "green",
                    lineTension: 0,
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Numero delle vendite mese'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                tooltips: {
                   callbacks: {
                       label: function(tooltipItem, data) {
                           var label = data.datasets[tooltipItem.datasetIndex].label + ': ';
                           label += tooltipItem.yLabel;
                           label += ' €';
                           return label;
                       }
                   }
               }
            }
        })
    }

    function vendite_persona(data,aggiorna) {
        //creo un oggetto contenente le vendite per persona
        var vendite_persona = {};
        var ammontare_totale = 0;

        //creo un ciclo for per ottenere la lista delle vendite
        for (var i = 0; i < data.length; i++) {
            var vendita_corrente = data[i];
            var venditore_corrente = vendita_corrente.salesman;
            var ammontare_corrente = parseFloat(vendita_corrente.amount);

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
            var vendita_percentuale = (vendite_persona[key] / ammontare_totale * 100).toFixed(1);
            //sovrascrivo il valore dell'oggetto
            vendite_persona[key] = vendita_percentuale;
        }

        //recupero la chiave dell'oggetto
        var persona_venditore = Object.keys(vendite_persona);
        var ammontare_persona = Object.values(vendite_persona);

        //popolo la select dei venditori
        popola_select_venditori(persona_venditore);

        //se la variabile aggiona è false setto il grafico per la prima volta
        if (aggiorna == false) {
            //setto il grafico
            imposta_grafico_venditore(persona_venditore, ammontare_persona);
        } else {
            //altrimenti lo aggiorno semplicemente
            //vado a selezionare il data e lo pongo uguale all'array aggiornato
            grafico_venditori.config.data.datasets[0].data = ammontare_persona;
            //uso la seguente funzione per aggiornare i dati nel grafico
            grafico_venditori.update();
        }
    }

    function imposta_grafico_venditore(persona, amount) {

        //creo una variabile contenente l'array di colori di sfondo
        var colori_sfondo = [];
        //creo una variabile conentente l'array di colori dei bordi
        var colori_bordo = [];
        //ciclo l'array persona per creare un numero random per ciascun venditore
        for (var i = 0; i < persona.length; i++) {
            var rosso = genera_random(0,255);
            var verde = genera_random(0,255);
            var blu = genera_random(0,255);
            colori_sfondo.push("rgba(" + rosso + "," + verde + "," + blu + ",0.2)");
            colori_bordo.push("rgba(" + rosso + "," + verde + "," + blu + ",1)");
        }

        //vado a settare il grafico (indico una variabile gloabale per aggiornarlo al fuori della funzione)
        grafico_venditori = new Chart($('#chart-venditori')[0].getContext('2d'), {
            type: 'pie',
            data: {
                labels: persona,
                datasets: [{
                    data: amount,
                    backgroundColor: colori_sfondo,
                    borderColor: colori_bordo
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Numero delle vendite divise per venditore'
                },
                legend: {
                    position: "left",
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var nome_venditore = data.labels[tooltipItem.index];
                            var percentuale_vendite = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            return nome_venditore + ': ' + percentuale_vendite + '%';
                        }
                    }
                }
            }
        })
    }

    function vendite_quarter(lista_vendite,aggiorna) {
        //creo una varibile contenente l'oggetto
        var vendite_quarter = {};

        //creo un ciclo for per creare le chiavi dell'oggetto quarters
        for (var i = 1; i <= 4; i++) {
            var quarter = "Q" + i;
            vendite_quarter[quarter] = 0;
        }

        //creo un ciclo for per assegnare i valori ai quarters
        for (var i = 0; i < lista_vendite.length; i++) {
            //tramite la lobreria moment vedo il quarter a cui corrisponde il mese
            var moment_quarter = moment(lista_vendite[i].date, "DD,MM,YYYY").quarter();
            //affianco il quarter alla stringa "Q"
            var quarter = "Q" + moment_quarter;
            //aggiungo la vendita al quarter corrispondente
            vendite_quarter[quarter]++
        }

        //creo una variabile con le chiavi dell'oggetto
        var quarters = Object.keys(vendite_quarter);
        //faccio lo stesso per ottenere i valori
        var numero_vendite = Object.values(vendite_quarter);

        //se la variabile aggiona è false setto il grafico per la prima volta
        if (aggiorna == false) {
            //setto il grafico a torta
            imposta_grafico_quarter(quarters, numero_vendite);
        } else {
            //altrimenti lo aggiorno semplicemente
            //vado a selezionare il data e lo pongo uguale all'array aggiornato
            grafico_quarter.config.data.datasets[0].data = numero_vendite;
            //uso la seguente funzione per aggiornare i dati nel grafico
            grafico_quarter.update();
        }
    }

    function imposta_grafico_quarter(quarters, numero_vendite) {
        //creo una variabile contenente l'array di colori di sfondo
        var colori_sfondo = [];
        //creo una variabile conentente l'array di colori dei bordi
        var colori_bordo = [];
        //ciclo l'array persona per creare un numero random per ciascun venditore
        for (var i = 0; i < quarters.length; i++) {
            var rosso = genera_random(0,255);
            var verde = genera_random(0,255);
            var blu = genera_random(0,255);
            colori_sfondo.push("rgba(" + rosso + "," + verde + "," + blu + ",0.3)");
            colori_bordo.push("rgba(" + rosso + "," + verde + "," + blu + ",1)");
        }

        //vado a settare il grafico (indico una variabile gloabale per aggiornarlo al fuori della funzione)
        grafico_quarter = new Chart($('#chart-quarters')[0].getContext('2d'), {
            type: 'bar',
            data: {
                labels: quarters,
                datasets: [{
                    data: numero_vendite,
                    backgroundColor: colori_sfondo,
                    borderColor: colori_bordo,
                    borderWidth: 1
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Numero delle vendite divise per quarter'
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

    function popola_select_mesi(lista_mesi) {
        //svuoto la select
        $("#month").empty();

        //aggiungo l'option di default
        var context = {
            "numero": "",
            "nome": "-- Seleziona un mese --"
        }
        var html_finale = template_function_mesi(context);
        $("#month").append(html_finale);

        //ciclo la lista dei mesi ed aggiungo per ognuno una option
        for (var i = 0; i < lista_mesi.length; i++) {
            //salvo il venditore corrente
            var mese_corrente = lista_mesi[i];
            //effettuo la somma di i ed 1 dato che parte da 0
            var numero_mese = i + 1;
            //se il numero_mese è minore di 10 gli aggiungo lo 0 come stringa(per non farlo sommare)
            if (numero_mese < 10) {
                numero_mese = "0" + numero_mese;
            }
            //creo il placeholder per handlebars
            var context = {
                "numero" : numero_mese,
                 "nome": mese_corrente
            };
            //preparo la funzione di handlebars
            var html_finale = template_function_mesi(context);
            //aggiungo l'html in pagina
            $("#month").append(html_finale);
        }
    }

    function popola_select_venditori(lista_venditori) {
        //svuoto la select
        $("#sellers").empty();

        //aggiungo l'option di default
        var context = {
            "numero": "",
            "nome": "-- Seleziona un venditore --"
        }
        var html_finale = template_function_venditori(context);
        $("#sellers").append(html_finale);

        //aggiungo per ogni venditore una option
        for (var i = 0; i < lista_venditori.length; i++) {
            //salvo il venditore corrente
            var venditore_corrente = lista_venditori[i];
            //creo il placeholder per handlebars
            var context = {
                "valore" : venditore_corrente,
                "nome": venditore_corrente
            }
            //preparo la funzione di handlebats
            var html_finale = template_function_venditori(context);
            //aggiungo l'html in pagina
            $("#sellers").append(html_finale);
        }
    }

    function genera_random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }
})
