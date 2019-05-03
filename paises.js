const mongooseTeg = require('./mongooseTeg')
const limites = require('./limites')

const mongoose = mongooseTeg.mongoose

let cargaPaises = []

const paisSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    archivo: String,
    posX: Number,
    posY: Number,
    limites : Array
})

limites.Limite.find((err, limites) => {
    if (err) return console.error(err)

    paisSchema.methods.limita = function(pais) {
        for (let limite of this.limites){
            if (limite == pais){
                return true
            }
        }
        return false
    }

    paisSchema.methods.distancia = function(pais) {
        if (this == pais){
            return 0
        }
    
        if (this.limita(pais)){
            return 1
        }
    
        for (let lim of this.limites){
            for (let limlim of lim.limites){
                if (limlim == pais){
                    return 2
                }
            }
        }
    
        for (let lim of this.limites){
            for (let limlim of lim.limites){
                for (let limlimlim of limlim.limites){
                    if (limlimlim == pais){
                        return 3
                    }
                }
            }
        }
        throw("muy lejos")
    }
    
    const Pais = mongoose.model('Pais', paisSchema)

    Pais.find((err, paises) => {
        if (err) return console.error(err)
        for (limite of limites){
            paises[limite.pais1-1].limites.push(paises[limite.pais2-1])
            paises[limite.pais2-1].limites.push(paises[limite.pais1-1])
        }
        console.log(paises)
        cargaPaises = paises
        console.log(paises[0].limita(paises[11]))
        console.log(paises[0].distancia(paises[11]))
    })
})



exports.paises = cargaPaises