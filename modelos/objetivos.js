const mongoose = require('./mongooseTeg').mongoose

const objetivoSchema = new mongoose.Schema({
    id: Number,
    nombre: String
})

const Objetivo = mongoose.model('objetivos', objetivoSchema)

exports.Objetivo = Objetivo