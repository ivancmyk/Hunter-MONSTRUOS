let buscaminas = (function () {

    let tablero;
    let partidaTerminada;
    let numeroMinas;
    let filas;
    let columnas;
    let arrayCambios;
    let boolPartidaPerdida;
    let boolPartidaGanada;
    let arrayMinas;
    let banderasColocadas;

    function init(dificultad = 1) {
        switch (dificultad) {
            case '2':
                filas = 16;
                columnas = 16;
                numeroMinas = 30;
                break;
            case '3':
                filas = 30;
                columnas = 30;
                numeroMinas = 99;
                break;
            case '1':
            default:
                filas = 8;
                columnas = 8;
                numeroMinas = 10;
                break;
        }

        arrayMinas = [];

        crearTablero(filas, columnas);
        colocarMinas(numeroMinas);
        colocarNumeros();

        boolPartidaPerdida = false;
        boolPartidaGanada = false;

        partidaTerminada = false;
        arrayCambios = [];
        banderasColocadas = 0;
    }

    function comprobarPartidaTerminada() {
        if (partidaTerminada)
            throw new Error('La partida está acabada');
    }


    /**
     * Asigna a cada casilla el valor según el número de minas que hay alrededor
     */
    function colocarNumeros() {
        for (let x = 0; x < filas; x++) {
            for (let y = 0; y < columnas; y++) {
                let casilla = getCasilla(x, y);
                if (casilla.tipo == 'mina')
                    continue;
                let numeroMinasAlrededor = 0;
                // Recorremos todas las casillas de alrededor y vemos si son minas para colocar el numero
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        try {
                            let casilla2 = tablero[(x + i)][(y + j)];
                            if (casilla2 != null && casilla2.tipo == 'mina' && casilla2 != undefined)
                                numeroMinasAlrededor++;
                        } catch (error) {
                            continue;
                        }
                    }
                }
                casilla.valorMostrar = numeroMinasAlrededor.toString();
            }
        }
    }

    /**
     * Devuelve el número de casillas sin descubrir
     */
    function getCasillasRestantes() {
        let contador = 0;
        for (let x = 0; x < filas; x++)
            for (let y = 0; y < columnas; y++)
                if (!getCasilla(x, y).descubierto)
                    contador++;
        return contador;
    }

    /**
     * Crea un tablero en función del tamaño pasado.
     * @param {Número de filas} filas 
     * @param {Número de columnas} columnas 
     */
    function crearTablero(filas, columnas) {
        let matriz = [];
        for (let i = 0; i < filas; i++) {
            matriz[i] = []
            for (let j = 0; j < columnas; j++) {
                matriz[i][j] = new Casilla('normal');
            }
        }
        tablero = matriz;
    }

    /**
     * Devuelve la casilla en las coordenadas indicadas. En caso de que no exista, salta una excepción
     * @param {Posición x (ancho) en el tablero} x 
     * @param {Posición y (alto) en el tablero} y 
     */
    function getCasilla(x, y) {
        try {
            if (tablero[x][y] == undefined)
                throw new Error();
            return tablero[x][y];
        } catch (error) {
            throw new Error("La posición seleccionada no es válida");
        }

    }

    /**
     * Coloca el número de minas indicado en el tablero.
     * @param {Número de minas a colocar} numeroMinas 
     */
    function colocarMinas(numeroMinas) {
        let minasColocadas = 0;
        do {
            let [casilla, y, x] = getCasillaAleatoria(tablero);
            if (casilla.tipo === "normal") {
                casilla.convertirMina();
                minasColocadas++;
                arrayMinas.push([y + "-" + x, casilla]);
            }
        } while (minasColocadas < numeroMinas);

    }

    /**
     * Devuelve una casilla aleatoria del tablero;
     */
    function getCasillaAleatoria() {
        let x = Math.floor(Math.random() * filas) + 0;
        let y = Math.floor(Math.random() * columnas) + 0;
        return [tablero[x][y], x, y];
    }

    //Devuelve una matriz con todo el contenido del tablero
    function mostrarTableroJuego() {
        return tablero;
    }

    // Devuelve un array con las coordenadas de las casillas afectadas
    function mostrarCambios() {
        // Devolvemos el array a la vez que lo reseteamos
        let varTemp = arrayCambios;
        arrayCambios = [];
        return varTemp;
    }

    // Función cuando picas una casilla
    function picarCasilla(x, y, recursivo = false) {
        try {
            comprobarPartidaTerminada();
            let casilla = getCasilla(x, y);
            if (casilla.deshabilitado === true || casilla.bandera === true || casilla.descubierto === true)
                return;

            casilla.descubierto = true;
            arrayCambios.push([x + "-" + y, casilla]);

            // Si has tocado una mina, pierdes
            if (casilla.tipo === 'mina')
                perder();
            // Si el valor de la mina que tienes es '0', se descubren recursivamente
            if (parseInt(casilla.valorMostrar) == 0)
                descubrirRecursivo(x, y);
            comprobarGanar();

        } catch (error) {
            console.error(error);
        }

    }

    function getMinas() {
        return arrayMinas;
    }

    function descubrirRecursivo(x, y) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                try {
                    let casilla = getCasilla((parseInt(x) + i), (parseInt(y) + j));
                    if (casilla != undefined && casilla.descubierto === false && casilla.deshabilitado == false)
                        picarCasilla((parseInt(x) + i), (parseInt(y) + j));
                } catch (error) {
                    continue;
                }
            }
        }
    }

    function mostrarDebug() {
        console.log('------- Buscaminas by Sojo -----------');
        for (x = 0; x < filas; x++) {
            linea = x + "-\t|";
            for (y = 0; y < columnas; y++) {
                let casilla = getCasilla(y, x);
                linea += casilla.valorMostrar + " ";
            }
            linea += "| -" + x;
            console.log(linea);
        }
    };

    function comprobarGanar() {
        if (getCasillasRestantes() == numeroMinas)
            ganar();
    }

    function perder() {
        partidaTerminada = true;
        boolPartidaPerdida = true;
        arrayCambios = getMinas();
    }

    function getNumeroBanderasAlrededor(x, y) {
        let numeroBanderas = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                try {
                    let casilla = getCasilla((x + i), (y + j));
                    if (casilla != null && casilla.bandera === true && casilla != undefined)
                        numeroBanderas++;
                } catch (error) {
                    continue;
                }
            }
        }
        return numeroBanderas;
    }

    function getCasillaSinDespejarAlrededor(x, y) {
        let arrayCasillas = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                try {
                    let casilla = getCasilla((parseInt(x) + i), (parseInt(y) + j));
                    if (casilla != undefined && casilla.descubierto === false && casilla.deshabilitado == false && casilla.bandera == false)
                        arrayCasillas.push({
                            'x': (parseInt(x) + i),
                            'y': (parseInt(y) + j)
                        }); //,'casilla':casilla
                } catch (error) {
                    continue;
                }
            }
        }
        return arrayCasillas;
    }

    function despejarCasilla(x, y) {
        let casilla = getCasilla(x, y);
        if (casilla.descubierto === false || casilla.bandera === true) {
            // console.error('La casilla no está descubierta o tiene una bandera.');
            return;
        }
        let numeroBanderasAlrededor = getNumeroBanderasAlrededor(x, y);
        if (casilla.valorMostrar == numeroBanderasAlrededor)
            descubrirRecursivo(x, y);
        else {
            let error = new Error('No coincide el número de banderas con el número de minas alrededor.');
            error.casillas = getCasillaSinDespejarAlrededor(x, y);
            throw error;
        }
    }

    function ganar() {
        boolPartidaGanada = true;
        partidaTerminada = true;

        // To-Do: optimizar:
        getMinas().forEach(elemento => arrayCambios.push(elemento));
    }

    function marcarCasilla(x, y) {
        let casilla = getCasilla(x, y);
        if (casilla.deshabilitado === true || casilla.descubierto === true)
            throw new Error('La casilla está deshabilitada, marcada o ya descubierta.');


        let boolBandera = casilla.setBandera();

        if (boolBandera) {
            if (banderasColocadas >= buscaminas.nMinas()) {
                casilla.setBandera(); // Volvemos la bandera al estado anterior
                throw new Error('Ya has colocado el número máximo de banderas');
            }
            banderasColocadas++;

        } else
            banderasColocadas--;

        return boolBandera;
    }

    function isPartidaPerdida() {
        return boolPartidaPerdida;
    }

    function isPartidaGanada() {
        return boolPartidaGanada;
    }

    function getFilas() {
        return filas;
    }

    function getColumnas() {
        return columnas;
    }

    function getNumeroMinas() {
        return numeroMinas;
    }

    return {
        init: init,
        filas: getFilas,
        columnas: getColumnas,
        cambios: mostrarCambios,
        picar: picarCasilla,
        marcar: marcarCasilla,
        casilla: getCasilla,
        partidaPerdida: isPartidaPerdida,
        partidaGanada: isPartidaGanada,
        mostrar: mostrarDebug,
        nMinas: getNumeroMinas,
        despejar: despejarCasilla
    }
})();