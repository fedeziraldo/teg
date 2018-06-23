var pais=require("./pais")

const CARAS = 6;
const MAXIMO_NORMAL = 3;

/**
 * genera los vectores aleatorios de batalla para los dos paises, 
 * ordena y compara,
 * devuelve la cantidad de victorias en ataque
 * 
 * @param {*} paisA 
 * @param {*} paisD 
 * @returns cantidad de posiciones del vector de ataque de que supera al de defensa
 */
function atacar(paisA, paisD){
     noPuedeAtacar(paisA,paisD);
    let dadosA = [];
    let dadosD = []; 

    for (let i=0; i<Math.min(paisA.ejercitos-1, MAXIMO_NORMAL); i++){
        dadosA.push(tirarDado());
    }

    for (let i=0; i<Math.min(paisD.ejercitos, MAXIMO_NORMAL); i++){
        dadosD.push(tirarDado());
    }

    ordenarDados(dadosA);
    ordenarDados(dadosD);

    let ataqueGana = 0;
    let enfr = enfrentamientos(paisA, paisD);
    for (let i=0; i<enfr; i++){
        if (dadosA[i] > dadosD[i]){
            ataqueGana++;
        }
    }

    return ataqueGana;
}
function noPuedeAtacar(paisA,paisD){
    
    if(paisA.ejercitos<=1){
        throw('no hay suficiente ejercito')
    }
    if(paisA.jugador===paisD.jugador){
        throw('es el mismo jugador')
    }
    if((pais.limita(paisA,paisD))){
        throw('no son limitrofes')
    }
}
function enfrentamientoMisil(paisA, paisD){
    noPuedeAtacarMisiles(paisA,paisD)
   

    return 4-pais.distancia(paisA,paisd);
} 
function noPuedeAtacarMisiles(paisA,paisD){
    if(paisA.misiles<=1){
        throw('No hay misiles')
    }
    if(paisA.jugador===paisD.jugador){
        throw('es el mismo jugador')
    }
   
    
    if(paisD.misiles>=1){
        throw('no se puede lanzar misil')
     }
}


/**
 * simula la tirada del dado
 * 
 * @returns entero entre 1 y 6
 */
function tirarDado(){
    return Math.floor(Math.random()*CARAS)+1;
}

/**
 * ordena el vector de enteros
 * 
 * @param {*} dados 
 */
function ordenarDados(dados){
    for (let i=0; i<dados.length; i++){
        for (let j=i; j<dados.length; j++){
            if (dados[i] < dados[j]){
                let aux = dados[i];
                dados[i] = dados[j];
                dados[j] = aux;
            }
        }
    }
}

/**
 * cuantos dados cuentas en la batalla
 * 
 * @param {*} paisA 
 * @param {*} paisD 
 * @returns el minimo de dados entre ataque y defensa o sea la cantidad de fichas totales que se pierden
 */
function enfrentamientos(paisA, paisD){
    return Math.min(paisA.ejercitos-1, paisD.ejercitos, MAXIMO_NORMAL);
}

exports.atacar=atacar;
exports.enfrentamientos=enfrentamientos;
exports.enfrentamientoMisil=enfrentamientoMisil;
