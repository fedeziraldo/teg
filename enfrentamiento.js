const CARAS = 6
const MAXIMO_NORMAL = 3

function atacar(dadosA, dadosD){
    let ataqueGana = 0
    for (let i=0; i<enfrentamientos(dadosA, dadosD); i++){
        if (dadosA[i] > dadosD[i]){
            ataqueGana++
        }
    }
    return ataqueGana
}

function enfrentamientos(paisDtoA, paisDtoD){
    return Math.min(paisDtoA.ejercitos-1, paisDtoD.ejercitos, MAXIMO_NORMAL)
}

function tirarDadosA(paisDtoA){
    dados = []
    for (let i=0; i<Math.min(paisDtoA.ejercitos-1, MAXIMO_NORMAL); i++){
        dadosD.push(tirarDado())
    }
    return ordenar(dados)
}

function tirarDadosD(paisDtoD){
    dados = []
    for (let i=0; i<Math.min(paisDtoD.ejercitos, MAXIMO_NORMAL); i++){
        dadosD.push(tirarDado())
    }
    return ordenar(dados)
}

function tirarDado(){
    return Math.floor(Math.random()*CARAS)+1
}

function copiar(vector){
    aux = []
    for (elem of vector){
        aux.push(elem)
    }
    return aux
}

function desordenar(vector){
    for (let i=0; i<vector.length; i++){
        for (let j=0; j<vector.length; j++){
            if (Math.floor(Math.random()*2) == 0){
                let aux = vector[i]
                vector[i] = vector[j]
                vector[j] = aux
            }
        }
    }
}

function ordenar(dados){
    for (let i=0; i<dados.length; i++){
        for (let j=i; j<dados.length; j++){
            if (dados[i] < dados[j]){
                let aux = dados[i]
                dados[i] = dados[j]
                dados[j] = aux
            }
        }
    }
}
exports.atacar=atacar
exports.enfrentamientos=enfrentamientos
exports.tirarDadosD=tirarDadosD
exports.tirarDadosA=tirarDadosA
exports.tirarDado=tirarDado