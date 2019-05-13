const mongoose = require('./mongooseTeg').mongoose

const continenteSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    fichas: Number,
    escudo: String,
})

const Continente = mongoose.model('continentes', continenteSchema)

exports.Continente = Continente