/**
 * busca el pais de la lista con el id
 * @param {*} paises 
 * @param {*} id 
 */
function buscarPais(paises, id){
    for (let pais of paises){
        if (pais.id == id){
            return pais;
        }
    }
}

/**
 * se fija si el segundo pais limita con el primero
 * @param {*} pais 
 * @param {*} limite 
 * 
 * @returns true si el pais esta en la lista de paises de pais
 */
function limita(pais, limite){
    for (let lim of pais.limites){
        if (lim == limite.id){
            return true;
        }
    }
    return false;
}

/**
 * devuelve cuantos limites hay que cruzar hasta llegar de un pais al otro, hasta 3
 * 
 * @param {*} pais 
 * @param {*} limite 
 * @returns distancia entre paises en base a las listas de limites
 * @throws error si la distancia es mayor a 3
 */
function distancia(pais, limite){

    if (pais == limite){
        return 0;
    }

    for (let lim of pais.limites){
        if (lim == limite.id){
            return 1;
        }
    }

    for (let lim of paises.limites){
        for (let limlim of buscarPais(lim).limites){
            if (limlim == limite.id){
                return 2;
            }
        }
    }

    for (let lim of paises.limites){
        for (let limlim of buscarPais(lim).limites){
            for (let limlimlim of buscarPais(limlim).limites){
                if (limlimlim == limite.id){
                    return 3;
                }
            }
        }
    }
    throw("muy lejos");
}

exports.buscarPais=buscarPais;
exports.limita=limita;
exports.distancia=distancia;