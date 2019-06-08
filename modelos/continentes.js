const mongoose = require('./mongooseTeg').mongoose
const Schema = mongoose.Schema;

const continenteSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    fichas: Number,
    escudo: { type: Schema.Types.ObjectId, ref: 'escudos' }
})

const Continente = mongoose.model('continentes', continenteSchema)

exports.Continente = Continente