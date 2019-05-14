const mongoose = require('./mongooseTeg').mongoose

const paisSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    archivo: String,
    posX: Number,
    posY: Number,
    continente: Number,
    escudo: String,
    limites: Array
})

paisSchema.methods.limita = function (pais) {
    for (let limite of this.limites) {
        if (limite == pais) {
            return true
        }
    }
    return false
}

paisSchema.methods.distancia = function (pais) {
    let distancia = 0
    if (this == pais) {
        return distancia
    }
    distancia++
    if (this.limita(pais)) {
        return distancia
    }
    distancia++
    for (let lim of this.limites) {
        for (let limlim of lim.limites) {
            if (limlim == pais) {
                return distancia
            }
        }
    }
    distancia++
    for (let lim of this.limites) {
        for (let limlim of lim.limites) {
            for (let limlimlim of limlim.limites) {
                if (limlimlim == pais) {
                    return distancia
                }
            }
        }
    }
    throw ("muy lejos")
}

const Pais = mongoose.model('paises', paisSchema)

exports.Pais = Pais