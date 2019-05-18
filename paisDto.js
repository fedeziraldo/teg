class PaisDto {
    constructor(pais) {
        this.id = pais.id
        this.nombre = pais.nombre
        this.archivo = pais.archivo
        this.posX = pais.posX
        this.posY = pais.posY
        this.escudo = pais.escudo
        this.continente = pais.continente
        this.jugador = ""
        this.ejercitos = 1
        this.misiles = 0
        this.limites = []
    }

    static get BLOQUEO() {
        return 3
    }

    bloqueado(limiteDtos) {
        if (limiteDtos.length < PaisDto.BLOQUEO) {
            return false
        }
        const bloqueador = limiteDtos[0].jugador
        if (bloqueador == this.jugador) {
            return false
        }
        for (let limiteDto of limiteDtos) {
            if (limiteDto.ejercitos < 1 || limiteDto.jugador != bloqueador) {
                return false
            }
        }
        return true
    }
}

exports.PaisDto = PaisDto