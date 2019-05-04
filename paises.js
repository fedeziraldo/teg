const mongoose = require('./mongooseTeg').mongoose

const paisSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    archivo: String,
    posX: Number,
    posY: Number,
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
    if (this == pais) {
        return 0
    }
    if (this.limita(pais)) {
        return 1
    }
    for (let lim of this.limites) {
        for (let limlim of lim.limites) {
            if (limlim == pais) {
                return 2
            }
        }
    }
    for (let lim of this.limites) {
        for (let limlim of lim.limites) {
            for (let limlimlim of limlim.limites) {
                if (limlimlim == pais) {
                    return 3
                }
            }
        }
    }
    throw ("muy lejos")
}

const Pais = mongoose.model('paises', paisSchema)

exports.Pais = Pais