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

function enfrentamientos(paisDtoA, paisDtoD) {
    return Math.min(paisDtoA.ejercitos - 1, paisDtoD.ejercitos, MAXIMO_NORMAL)
}

function tirarDadosA(paisDtoA) {
    return tirarDados(paisDtoA.ejercitos - 1)
}

function tirarDadosD(paisDtoD) {
    return tirarDados(paisDtoD.ejercitos)
}

function tirarDados(cantidad) {
    let dados = []
    for (let i = 0; i < Math.min(cantidad, MAXIMO_NORMAL); i++) {
        dados.push(tirarDado())
    }
    return ordenar(dados)
}

function tirarDado() {
    return Math.floor(Math.random() * CARAS) + 1
}

function ordenar(dados) {
    for (let i = 0; i < dados.length; i++) {
        for (let j = i; j < dados.length; j++) {
            if (dados[i] < dados[j]) {
                let aux = dados[i]
                dados[i] = dados[j]
                dados[j] = aux
            }
        }
    }
    return dados
}
exports.atacar = atacar
exports.enfrentamientos = enfrentamientos
exports.tirarDadosD = tirarDadosD
exports.tirarDadosA = tirarDadosA
exports.tirarDado = tirarDado