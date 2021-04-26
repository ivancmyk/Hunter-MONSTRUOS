{
    let tableroArrayDom;
    let $tableroDom, $spanMinutos, $spanSegundos, $spanBanderas;
    let intervalReloj, banderasColocadas;
    let dificultad, primeraPartida, contadorAnimaciones;
    primeraPartida = true;

    $(() => {
        $spanMinutos = $("#minutos");
        $spanSegundos = $("#segundos");
        $spanBanderas = $('#numBanderas');

        $('#select-dificultad').change(iniciaJuego).change();
        console.log('Para debug del buscaminas, llamar a buscaminas.mostrar()');
        $('body').contextmenu(e => e.preventDefault());
        $('.reiniciar').click(iniciaJuego);
    });


    function iniciaJuego() {
        activarReloj();

        // Para comprobar cuando se inicia desde la alerta cuando pierdes
        if (this == window || $(this).hasClass('reiniciar'))
            dificultad = $('#select-dificultad').val();
        else
            dificultad = this.value;

        buscaminas.init(dificultad);
        $tableroDom = $('#tableroJuego');

        iniciarTablero();
        banderasColocadas = 0;
        $spanBanderas.text(banderasColocadas);
        $('#banderasTotales').text(buscaminas.nMinas());

        if (!primeraPartida)
            $('#tableroJuego').fadeOut(500, function () {
                $(this).fadeIn(500);
            });
        primeraPartida = false;

    }

    // Pinta por primera vez el tablero
    function iniciarTablero() {
        let alto = buscaminas.filas();
        let ancho = buscaminas.columnas();
        let tipoJuego;

        if (dificultad == 1)
            tipoJuego = 'juegoPequenio';
        else if (dificultad == 2)
            tipoJuego = 'juegoMediano';
        else
            tipoJuego = 'juegoGrande';

        tableroArrayDom = new Array(alto);

        let divContenedor = $('<div></div>');
        for (let i = 0; i < alto; i++) {
            tableroArrayDom[i] = [];
            for (let x = 0; x < ancho; x++) {
                tableroArrayDom[i].push(
                    $('<div class="casillaBuscamina ' + tipoJuego + '" id="' + x + '-' + i + '"></div>')
                    .click(function (e) {
                        // Click izquierdo
                        if (e.buttons === 2)
                            return;
                        picarCasilla($(this));
                    })
                    .on('mousedown', function (e) {
                        let boton = e.buttons;
                        if (boton === 3) // Ambos botones
                            despejar($(this));
                        else if (boton === 2) // Click derecho
                            colocarBandera($(this));
                    })
                    .data('x', x)
                    .data('y', i)
                );
                divContenedor.append(tableroArrayDom[i][x]);
            }
        }
        $tableroDom.html(divContenedor);
        $('.Tablero>div').css("grid-template-columns", "repeat(" + ancho + ",1fr)");
    }

    function despejar($casilla) {
        let y = $casilla.data('y');
        let x = $casilla.data('x');

        try {
            buscaminas.despejar(x, y);
            if (comprobarPerderGanar())
                mostrarCambios();
        } catch (error) {
            parpadeaCasillas(error.casillas);
            muestraMensajeError(error); // -> Cuando no concide el número de banderas y el numero de la casilla
        }
    }

    function parpadeaCasillas(casillas) {
        casillas.forEach(element => {
            $casilla = $('#' + element.x + '-' + element.y).effect('pulsate', {
                'times': 3
            }, 500);
        });
    }

    function picarCasilla($casilla) {
        let y = $casilla.data('y');
        let x = $casilla.data('x');
        buscaminas.picar(x, y);
        if (comprobarPerderGanar())
            mostrarCambios();
    }

    function comprobarPerderGanar() {
        if (buscaminas.partidaPerdida()) {
            perder();
            return false;
        }
        if (buscaminas.partidaGanada()) {
            ganar();
            return false;
        }

        return true;
    }

    function colocarBandera($casilla) {

        let y = $casilla.data('y');
        let x = $casilla.data('x');

        try {
            if (buscaminas.marcar(x, y)) {
                $casilla.addClass('casillaMarcada');
                sumarBandera(1);
            } else {
                $casilla.removeClass('casillaMarcada');
                sumarBandera(-1);
            }
            $casilla.effect('highlight', 200);
            $spanBanderas.effect("bounce", "swing", 500);
            let audio = new Audio();
            audio.src = './sounds/destapar.mp3';
            audio.play();
        } catch (error) {
            muestraMensajeError(error);
        }
    }



    function sumarBandera(cantidad) {
        banderasColocadas += cantidad;
        $('#numBanderas').text(banderasColocadas);
    }

    function mostrarCambios() {
        let arrayCambios = buscaminas.cambios();
        contadorAnimaciones = 150;

        if (arrayCambios.length > 0) {
            let audio = new Audio();
            audio.src = './sounds/picar.mp3';
            audio.play();
        }


        for (let i = 0; i < arrayCambios.length; i++) {
            $casilla = $('#' + arrayCambios[i][0]);
            let casillaDatos = arrayCambios[i][1];





            if (casillaDatos.tipo == 'mina')
                $casilla.addClass('casillaDescubierta').effect('shake', {}, contadorAnimaciones + 1000, function () {
                    $(this).fadeIn(1000).html(casillaDatos.valorMostrar).addClass('mina').addClass('minaGanada');
                });
            else
                $casilla.addClass('casillaDescubierta').effect('puff', {}, contadorAnimaciones, function () {
                    $(this).fadeIn(200).html((casillaDatos.valorMostrar == '0') ? '' : casillaDatos.valorMostrar);
                });
 


            // Para evitar que la animación tarde más de 2 segundos
            if (contadorAnimaciones < 2000)
                contadorAnimaciones += 20;
        }
    }



    function mostrarCambiosPerder() {
        let audio = new Audio();
        audio.src = './sounds/Mounstro.mp3';
        audio.play();
        let arrayCambios = buscaminas.cambios();
        contadorAnimaciones = 500;
        for (let i = 0; i < arrayCambios.length; i++) {
            $casilla = $('#' + arrayCambios[i][0]);
            let casillaDatos = arrayCambios[i][1];
            $casilla.html((casillaDatos.valorMostrar == '0') ? '' : casillaDatos.valorMostrar);
            $casilla.addClass('casillaDescubierta', contadorAnimaciones)
                .addClass('mina', contadorAnimaciones);
            $('span', $casilla)
                .animate({
                    'font-size': '3em'
                }, contadorAnimaciones)
                .fadeOut(contadorAnimaciones + 300);
            if (contadorAnimaciones < 2500)
                contadorAnimaciones += 300;
        }

    }

    async function ganar() {


        let audio = new Audio();
        audio.src = './sounds/ganar.mp3';
        audio.play();
        mostrarCambios();
        $('.casillaBuscamina').off('mousedown');
        pararReloj();
        await sleep(contadorAnimaciones + 1000);

        janelaPopUp.abre("2", 'p green', '¡Has ganado!', 'Enhorabuena, has ganado la partida en ' + $('#minutos').text() + ' minutos y ' + $('#segundos').text() + ' segundos.', undefined, iniciaJuego, 'Cerrar', 'Jugar de nuevo');


    }

    async function perder() {
        // Desactivamos el tablero
        $('.casillaBuscamina').off('mousedown');
        $('.reiniciar').off('click');
        // Mostramos las minas
        mostrarCambiosPerder();
        pararReloj();

        await sleep(contadorAnimaciones + 1500);
        $('.reiniciar').click(iniciaJuego);
        janelaPopUp.abre("2", 'p red', '¡Has perdido!', 'Oohh, has sido atrapado por el Mounstro', undefined, iniciaJuego, 'Cerrar', 'Jugar de nuevo');
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function activarReloj() {
        // Se resetean antes de nada para un efecto visual bonito
        $spanMinutos.text('00');
        $spanSegundos.text('00');
        let tiempo = {
            hora: 0,
            minuto: 0,
            segundo: 0
        };

        pararReloj();

        intervalReloj = setInterval(function () {
            tiempo.segundo++;
            if (tiempo.segundo >= 60) {
                tiempo.segundo = 0;
                tiempo.minuto++;
            }
            if (tiempo.minuto >= 60) {
                tiempo.minuto = 0;
                tiempo.hora++;
            }
            $spanMinutos.text(tiempo.minuto < 10 ? '0' + tiempo.minuto : tiempo.minuto);
            $spanSegundos.text(tiempo.segundo < 10 ? '0' + tiempo.segundo : tiempo.segundo);
        }, 1000);
    }


    function pararReloj() {
        clearInterval(intervalReloj);
    }

}

function muestraMensajeError(mensaje) {
    Toastify({
        text: mensaje,
        duration: 3000
    }).showToast();
}



// ################################
// Código para alertas:
// ################################

var janelaPopUp = new Object();
janelaPopUp.abre = function (id, classes, titulo, corpo, functionCancelar, functionEnviar, textoCancelar, textoEnviar) {
    var cancelar = (textoCancelar !== undefined) ? textoCancelar : 'Cancel';
    var enviar = (textoEnviar !== undefined) ? textoEnviar : 'Send';
    classes += ' ';
    var classArray = classes.split(' ');
    classes = '';
    classesFundo = '';
    var classBot = '';
    $.each(classArray, function (index, value) {
        switch (value) {
            case 'alert':
                classBot += ' alert ';
                break;
            case 'blue':
                classesFundo += this + ' ';
            case 'green':
                classesFundo += this + ' ';
            case 'red':
                classesFundo += this + ' ';
            case 'white':
                classesFundo += this + ' ';
            case 'orange':
                classesFundo += this + ' ';
            case 'purple':
                classesFundo += this + ' ';
            default:
                classes += this + ' ';
                break;
        }
    });
    var popFundo = '<div id="popFundo_' + id + '" class="popUpFundo ' + classesFundo + '"></div>'
    var janela = '<div id="' + id + '" class="popUp ' + classes + '"><h1>' + titulo + "</h1><div><span>" + corpo + "</span></div><button class='puCancelar " + classBot + "' id='" + id + "_cancelar' data-parent=" + id + ">" + cancelar + "</button><button class='puEnviar " + classBot + "' data-parent=" + id + " id='" + id + "_enviar'>" + enviar + "</button></div>";
    $("window, body").css('overflow', 'hidden');

    $("body").append(popFundo);
    $("body").append(janela);
    $("body").append(popFundo);
    $("#popFundo_" + id).fadeIn("fast");
    $("#" + id).addClass("popUpEntrada");

    $("#" + id + '_cancelar').on("click", function () {
        if ((functionCancelar !== undefined) && (functionCancelar !== '')) {
            functionCancelar();

        } else {
            janelaPopUp.fecha(id);
        }
    });
    $("#" + id + '_enviar').on("click", function () {
        if ((functionEnviar !== undefined) && (functionEnviar !== ''))
            functionEnviar();
        janelaPopUp.fecha(id);

    });

};
janelaPopUp.fecha = function (id) {
    if (id !== undefined) {
        $("#" + id).removeClass("popUpEntrada").addClass("popUpSaida");

        $("#popFundo_" + id).fadeOut(1000, function () {
            $("#popFundo_" + id).remove();
            $("#" + $(this).attr("id") + ", #" + id).remove();
            if (!($(".popUp")[0])) {
                $("window, body").css('overflow', 'auto');
            }
        });


    } else {
        $(".popUp").removeClass("popUpEntrada").addClass("popUpSaida");

        $(".popUpFundo").fadeOut(1000, function () {
            $(".popUpFundo").remove();
            $(".popUp").remove();
            $("window, body").css('overflow', 'auto');
        });


    }
}
$("button").on("click", function () {
    var myText = $("#myText").val();
    janelaPopUp.abre("asdf", $("#size").val() + " " + $(this).html() + ' ' + $("#mode").val(), $("#title").val(), myText)
});