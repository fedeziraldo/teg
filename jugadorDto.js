class JugadorDto {
    constructor(color, nombre) {
        this.color = color
        this.nombre = nombre
        this.cantidadCanjes = 0
        this.paisesCapturadosRonda = 0
        this.cartasPais = []
        this.cartasContinente = []
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

    paisesJugador(paisesDto) {
        const paises = []
        for (let paisDto of paisesDto) {
            if (paisDto.jugador == this) {
                paises.push(paisDto)
            }
        }
        return paises
    }

    paisesContinente(paisesDto, continente) {
        const paises = this.paisesJugador(paisesDto)
        for (let paisDto of continente.paisesContinente(paisesDto)) {
            if (paises.indexOf(paisDto) != -1) {
                paises.push(paisDto)
            }
        }
        return paises
    }

    conquistaContinente(paisesDto, continente) {
        return continente.paisesContinente(paisesDto).length == this.paisesContinente(paisesDto, continente).length
    }
}

exports.JugadorDto = JugadorDto