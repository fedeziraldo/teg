const mongoose = require('./mongooseTeg').mongoose

const objetivos = [europaAmSur, amNorteOceania6Africa, asiaAmCentral,europaAmSur, amNorteOceania6Africa, asiaAmCentral,europaAmSur, amNorteOceania6Africa, asiaAmCentral,europaAmSur, amNorteOceania6Africa, asiaAmCentral,europaAmSur, amNorteOceania6Africa, asiaAmCentral,europaAmSur, amNorteOceania6Africa, asiaAmCentral,europaAmSur, amNorteOceania6Africa, asiaAmCentral]

const objetivoSchema = new mongoose.Schema({
    id: Number,
    nombre: String
})

objetivoSchema.methods.cumpleObjetivo = function (jugadorA, jugadorD, paisesDto, continentesDto) {
    return objetivos[this.id - 1](jugadorA, jugadorD, paisesDto, continentesDto)
}

const Objetivo = mongoose.model('objetivos', objetivoSchema)

exports.Objetivo = Objetivo

function europaAmSur(jugadorA, jugadorD, paisesDto, continentesDto) {
    if (jugadorA.conquistaContinente(paisesDto, continentesDto[5]) &&
            jugadorA.conquistaContinente(paisesDto, continentesDto[3])) {
        return true
    }
    return false
}

function amNorteOceania6Africa(jugadorA, jugadorD, paisesDto, continentesDto) {
    if (jugadorA.conquistaContinente(paisesDto, continentesDto[2]) &&
            jugadorA.conquistaContinente(paisesDto, continentesDto[6]) &&
            jugadorA.paisesContinente(paisesDto, continentesDto[0]) >= 6) {
        return true
    }
    return false
}

function asiaAmCentral(jugadorA, jugadorD, paisesDto, continentesDto) {
    if (jugadorA.conquistaContinente(paisesDto, continentesDto[4]) &&
            jugadorA.conquistaContinente(paisesDto, continentesDto[1])) {
        return true
    }
    return false
}