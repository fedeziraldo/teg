const MongoClient = require('mongodb').MongoClient;

let cartasGlobales = [];
let cartaGlobal;

/**
 * carga la lista de cartas globales de la base, las desordena y envia una a los clientes
 * @param {*} url 
 * @param {*} nombredb 
 * @param {*} io 
 */
function cargarCartasGlobales(url, nombredb, io){
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;
        let dbo = db.db(nombredb);
        dbo.collection("cartaGlobal").find({}).toArray((err, result) => {
            if (err) throw err;
            for (let i=0; i<result.length; i++){
                for(let j=0; j<result[i].cantidad; j++){
                    cartasGlobales.push(result[i]);
                }
            }
            desordenar(cartasGlobales);
            let carta = sacarCarta();
            io.emit("cartaGlobal", carta);
        });
    });
}

/**
 * mezcla la lista de cartas
 * @param {*} cartas 
 */
function desordenar(cartas){
    for (let i=0; i<cartas.length; i++){
        for (let j=0; j<cartas.length; j++){
            if (Math.random() < .5){
                let aux = cartas[i];
                cartas[i] = cartas[j];
                cartas[j] = aux;
            }
        }
    }
}

/**
 * devuelve una carta del final y la pone al principio y la devuelve
 * @returns ultima carta
 */
function sacarCarta(){
    cartaGlobal = cartasGlobales.pop();
    cartasGlobales.push(cartaGlobal)
    return cartaGlobal;
}

exports.cargarCartasGlobales=cargarCartasGlobales;
exports.sacarCarta=sacarCarta;