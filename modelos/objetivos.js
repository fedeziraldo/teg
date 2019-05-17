const mongoose = require('./mongooseTeg').mongoose

const objetivos = [europaAmSur, amNorteOceania6Africa, asiaAmCentral]

const objetivoSchema = new mongoose.Schema({
    id: Number,
    nombre: String
})

paisSchema.methods.cumpleObjetivo = function (jugadorA, jugadorD, paisesDto, continentes) {
    return objetivos[this.id - 1](jugadorA, jugadorD, paisesDto, continentes)
}

const Objetivo = mongoose.model('objetivos', objetivoSchema)

exports.Objetivo = Objetivo

function europaAmSur(jugadorA, jugadorD, paisesDto, continentes) {
    if (jugadorA.conquistaContinente(paisesDto, continentes[5]) &&
            jugadorA.conquistaContinente(paisesDto, continentes[3])) {
        return true
    }
    return false
}

function amNorteOceania6Africa(jugadorA, jugadorD, paisesDto, continentes) {
    if (jugadorA.conquistaContinente(paisesDto, continentes[2]) &&
            jugadorA.conquistaContinente(paisesDto, continentes[6]) &&
            jugadorA.paisesContinente(paisesDto, continentes[0]) >= 6) {
        return true
    }
    return false
}

function asiaAmCentral(jugadorA, jugadorD, paisesDto, continentes) {
    if (jugadorA.conquistaContinente(paisesDto, continentes[4]) &&
            jugadorA.conquistaContinente(paisesDto, continentes[1])) {
        return true
    }
    return false
}