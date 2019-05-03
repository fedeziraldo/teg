const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/teg', { useNewUrlParser: true })

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log("Base TEG conectada")
})

exports.mongoose = mongoose