const CARAS = 6
const MAXIMO_NORMAL = 3

function atacar(dadosA, dadosD, enfrentamientos) {
    let ataqueGana = 0
    for (let i = 0; i < enfrentamientos; i++) {
        if (dadosA[i] > dadosD[i]) {
            ataqueGana++
        }
    }
    return ataqueGana
}

function enfrentamientos(ejercitosA, ejercitosD) {
    return Math.min(ejercitosA - 1, ejercitosD, MAXIMO_NORMAL)
}

function tirarDadosA(ejercitosA, ejercitosD, ataque) {
    return tirarDados(Math.min(ejercitosA - 1, MAXIMO_NORMAL + duplica(ejercitosA, ejercitosD) + ataque, MAXIMO_NORMAL + 1))
}

function tirarDadosD(ejercitos, defensa) {
    return tirarDados(Math.min(ejercitos, MAXIMO_NORMAL + defensa))
}

function tirarDados(cantidad) {
    const dados = []
    for (let i = 0; i < cantidad; i++) {
        dados.push(tirarDado())
    }
    return ordenar(dados)
}

function tirarDado() {
    return Math.ceil(Math.random() * CARAS)
}

function ordenar(dados) {
    for (let i = 0; i < dados.length; i++) {
        for (let j = i; j < dados.length; j++) {
            if (dados[i] < dados[j]) {
                const aux = dados[i]
                dados[i] = dados[j]
                dados[j] = aux
            }
        }
    }
    return dados
}

function duplica(ejercitosA, ejercitosD){
    return ejercitosA >= 2*ejercitosD && ejercitosD >= MAXIMO_NORMAL ? 1 : 0
}

exports.atacar = atacar
exports.enfrentamientos = enfrentamientos
exports.tirarDadosD = tirarDadosD
exports.tirarDadosA = tirarDadosA
exports.tirarDado = tirarDado