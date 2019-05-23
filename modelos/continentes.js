const mongoose = require('./mongooseTeg').mongoose

const continenteSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    fichas: Number,
    escudo: String,
    jugadores: []
})

continenteSchema.methods.paisesContinente = function (paisesDto) {
    const paises = []
    for (let paisDto of paisesDto) {
        if (this.id == paisDto.continente) {
            paises.push(paisDto)
        }
    }
    return paises
}

const Continente = mongoose.model('continentes', continenteSchema)

exports.Continente = Continente