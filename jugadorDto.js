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

    static get LIMITE_CANJE() {
        return 3
    }

    static canjear(canje) {
        return canje.length <= 3 && canje.includes("A") && canje.includes("S") && canje.includes("B")
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
        if (cartas.length == 0) {
            throw ("proba usar cartas")
        }
        for (let carta of cartas) {
            if (this.cartasPais.indexOf(carta) == -1 && this.cartasContinente.indexOf(carta) == -1) {
                throw ("no tenes esas cartas")
            }
        }
        for (let continente of continentes) {
            if (continente.jugadores.indexOf(this.color) != -1) {
                throw ("no podes usar 2 veces la misma tarjeta de continente")
            }
        }
        if (cartas.length == 1) {
            return JugadorDto.canjear(cartas[0].escudo.valor[0])
        }
        if (cartas.length == 2) {
            for (let valor0 in cartas[0].escudo.valor) {
                for (let valor1 in cartas[1].escudo.valor) {
                    if (JugadorDto.canjear(valor0 + valor1)) {
                        return true
                    }
                }
            }
            return false
        }
        for (let valor0 in cartas[0].escudo.valor) {
            for (let valor1 in cartas[1].escudo.valor) {
                for (let valor2 in cartas[2].escudo.valor) {
                    if (JugadorDto.canjear(valor0 + valor1 + valor2) ||
                            valor0valor0 == valor1 && valor1 == valor2) {
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

    paisesContinente(paisesDto, continenteDto) {
        const paises = []
        const paisesJugador = this.paisesJugador(paisesDto)
        for (let paisDto of continenteDto.paisesContinente(paisesDto)) {
            if (paisesJugador.indexOf(paisDto) != -1) {
                paises.push(paisDto)
            }
        }
        return paises
    }

    conquistaContinente(paisesDto, continenteDto) {
        return continenteDto.paisesContinente(paisesDto).length == this.paisesContinente(paisesDto, continenteDto).length
    }

    gana(paisD, paises, continentesDto) {
        if (this.paisesJugador(paises) >= 45) return true
        return this.objetivo.cumpleObjetivo(this, paisD.jugador, paises, continentesDto)
    }
}

exports.JugadorDto = JugadorDto