class ContinenteDto {
    constructor(continente) {
        this.id = continente.id
        this.nombre = continente.nombre
        this.fichas = continente.fichas
        this.escudo = continente.escudo
        this.jugadores = []
    }

    paisesContinente(paisesDto) {
        const paises = []
        for (let paisDto of paisesDto) {
            if (this == paisDto.continente) {
                paises.push(paisDto)
            }
        }
        return paises
    }
}

exports.ContinenteDto = ContinenteDto