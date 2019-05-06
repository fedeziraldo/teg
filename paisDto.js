class PaisDto {
    constructor(pais) {
        this.id = pais.id
        this.nombre = pais.nombre
        this.archivo = pais.archivo
        this.posX = pais.posX
        this.posY = pais.posY
        this.jugador = 0
        this.ejercitos = 1
        this.misiles = 0
    }
}

exports.PaisDto = PaisDto