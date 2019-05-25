class JugadorDto {
    constructor(color, nombre) {
        this.color = color
        this.nombre = nombre
        this.cantidadCanjes = 0
        this.paisesCapturadosRonda = 0
        this.cartasPais = []
        this.cartasContinente = []
        this.objetivo = "capturar 45 paises"
    }

    static get SUMA_CANJE() {
        return 7
    }

    static get LIMITE_CANJE() {
        return 3
    }

    puedeSacarCarta() {
        return this.paisesCapturadosRonda > 1 ||
            this.paisesCapturadosRonda > 0 && this.cantidadCanjes < JugadorDto.LIMITE_CANJE
    }

    puedeCanjear(paises, continentes) {
        const cartas = []
        cartas.push(...paises)
        cartas.push(...continentes)
        if (cartas.length > 3) {
            throw ("demasiadas cartas")
        }
        for (let carta in cartas) {
            if (this.cartasPais.indexOf(carta) == -1 && this.cartasContinente.indexOf(carta) == -1) {
                throw ("no tenes esas cartas")
            }
        }
        for (let continente of continentes) {
            if (continente.jugadores.indexOf(this.color) != -1) {
                throw ("no podes usar 2 veces la misma tarjeta de continente")
            }
        }
        if (cartas.length == 0) {
            throw ("proba usar cartas")
        }
        if (cartas.length == 1) {
            return cartas[0].escudo.valor[0] == JugadorDto.SUMA_CANJE
        }
        if (cartas.length == 2) {
            for (let valor0 in cartas[0].escudo.valor) {
                for (let valor1 in cartas[1].escudo.valor) {
                    if (valor0 + valor1 == JugadorDto.SUMA_CANJE) {
                        return true
                    }
                }
            }
            return false
        }
        for (let valor0 in cartas[0].escudo.valor) {
            for (let valor1 in cartas[1].escudo.valor) {
                for (let valor2 in cartas[2].escudo.valor) {
                    if (valor0 + valor1 + valor2 == JugadorDto.SUMA_CANJE ||
                        valor0 == valor1 && valor1 == valor2) {
                        return true
                    }
                }
            }
        }
        return false
    }

    fichasCanje() {
        if (this.cantidadCanjes == 0) return 6
        return 5 * this.cantidadCanjes
    }

    paisesJugador(paisesDto) {
        const paises = []
        for (let paisDto of paisesDto) {
            if (paisDto.jugador == this.color) {
                paises.push(paisDto)
            }
        }
        return paises
    }

    paisesContinente(paisesDto, continente) {
        const paises = []
        const paisesJugador = this.paisesJugador(paisesDto)
        for (let paisDto of continente.paisesContinente(paisesDto)) {
            if (paisesJugador.indexOf(paisDto) != -1) {
                paises.push(paisDto)
            }
        }
        return paises
    }

    conquistaContinente(paisesDto, continente) {
        return continente.paisesContinente(paisesDto).length == this.paisesContinente(paisesDto, continente).length
    }

    gana(paisD, paises, continentes) {
        if (this.paisesJugador(paises) >= 45) return true
        return this.objetivo.cumpleObjetivo(this, paisD.jugador, paises, continentes)
    }
}

exports.JugadorDto = JugadorDto