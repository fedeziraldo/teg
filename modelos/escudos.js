const mongoose = require('./mongooseTeg').mongoose

const escudoSchema = new mongoose.Schema({
    tipo: String,
    valor: Array
})

const Escudo = mongoose.model('escudos', escudoSchema)

exports.Escudo = Escudo