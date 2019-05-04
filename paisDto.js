class PaisDto {
    constructor(pais){
        this.id = pais.id
        this.nombre = pais.nombre
        this.archivo = pais.archivo
        this.posX = pais.posX
        this.posY = pais.posY
        this.ejercitos = 10
        this.misiles = 3
    }
}

exports.PaisDto = PaisDto