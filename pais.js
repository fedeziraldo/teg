const MongoClient = require('mongodb').MongoClient;

let paises;

/**
 * carga la variable paises con los paises de la base y la envia a los clientes 
 * 
 * @param {*} url 
 * @param {*} nombredb 
 * @param {*} io 
 * @param {*} clientes 
 */
function cargarPaises(url, nombredb, io, clientes){
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;
        let dbo = db.db(nombredb);
        dbo.collection("pais").find({}).toArray((err, result) => {
            if (err) throw err;
            for (let i=0; i<result.length; i++){
                result[i].jugador = i% Object.keys(clientes).length;
                result[i].ejercitos = 10;
                result[i].misiles = 3;
                result[i].limites = [];
            }
            paises = result;
            dbo.collection("limite").find({}).toArray((err, result) => {
                if (err) throw err;
                for (let i=0; i<result.length; i++){
                    let pais1 = buscarPais(result[i].pais1);
                    let pais2 = buscarPais(result[i].pais2);
                    pais1.limites.push(pais2.id);
                    pais2.limites.push(pais1.id);
                }
                io.emit("iniciaJuego", paises);
                db.close();
            });
        });
    });
}

/**
 * busca el pais de la lista paises con el id de pais
 * @param {*} id 
 */
function buscarPais(id){
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

    if (limita(pais, limite)){
        return 1;
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
exports.paises = paises;
exports.cargarPaises = cargarPaises;