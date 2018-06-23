const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const Enfrentamiento = require("./enfrentamiento");
const Paises = require("./pais");

const url = "mongodb://localhost:27017/";
let paises;
const clientes = {};

MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
  if (err) throw err;
  let dbo = db.db("fede");
  let myquery = {};
  let newvalues = {$set: {jugando: false} };
  dbo.collection("jugador").updateMany(myquery, newvalues, (err, res) =>{
    if (err) throw err;
    console.log("jugadores reiniciados");
    db.close();
  });
});

app.use(express.static(`${__dirname}/public`));

//extended: false significa que parsea solo string (no archivos de imagenes por ejemplo)
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'pug');
app.set('views','./views');

app.get('/', (req, res) => {
  res.render('index', {
    mensaje: ""
  });
});

app.post('/registrar', (req, res) => {
  MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    let dbo = db.db("fede");
    let query = { nombre: req.body.nombre };
    dbo.collection("jugador").findOne(query, (err, result) => {
      if (err) throw err;
      if (result == null){
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
          if (err) throw err;
          let dbo = db.db("fede");
          let myobj = { nombre: req.body.nombre, jugando: false };
          dbo.collection("jugador").insertOne(myobj, (err, result) => {
            if (err) throw err;
            console.log(`usuario ${req.body.nombre} registrado`);
            res.render('index', {
              mensaje: `usuario ${req.body.nombre} registrado`
            });
            db.close();
          });
        });
      }else{
        res.render('error', {
          mensaje: `ya existe ${req.body.nombre}`
        });
      }
    });
  });
});

app.post('/entrar', (req, res) => {
  MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
    if (err) throw err;
    let dbo = db.db("fede");
    let query = { nombre: req.body.nombre };
    dbo.collection("jugador").findOne(query, (err, result) => {
      if (err) throw err;
      if (result == null){
        res.render('error', {
          mensaje: `no existe perfil ${req.body.nombre}`
        });
        return;
      }
      if (result.jugando){
        res.render('error', {
          mensaje: `ya esta jugando ${req.body.nombre}`
        });
        return;
      }
      res.render('salaEspera', {
        nombre: req.body.nombre
      });
      db.close();
    });
  });  
});

io.on('connection', cliente => {
  cliente.on('nombre', nombre =>{
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      let dbo = db.db("fede");
      let myquery = { nombre: nombre};
      let newvalues = {$set: {jugando: true} };
      dbo.collection("jugador").updateMany(myquery, newvalues, (err, res) =>{
        if (err) throw err;
        cliente.broadcast.emit("agregarJugador", nombre);
        cliente.emit("listaJugadores", Object.keys(clientes));
        clientes[nombre] = cliente;
        console.log(`${nombre} conectado`);
        db.close();
      });
    });
  });

  cliente.on('disconnect', () => {
    for (let attr in clientes){
      if (clientes[attr] == cliente){
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
          if (err) throw err;
          let dbo = db.db("fede");
          let myquery = {nombre: attr};
          let newvalues = {$set: {jugando: false} };
          dbo.collection("jugador").updateMany(myquery, newvalues, (err, res) =>{
            if (err) throw err;
            console.log(`${attr} desconectado`);
            delete clientes[attr];
            io.emit("saleJugador", attr);
            db.close();
          });
        });
        break;
      }
    }
  });

  cliente.on('inicio', () => {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      var dbo = db.db("fede");
      dbo.collection("pais").find({}).toArray((err, result) => {
        if (err) throw err;
        for (let i=0; i<result.length; i++){
          result[i].jugador = i% Object.keys(clientes).length;
          result[i].ejercitos = 10;
          result[i].misiles = 3;
        }
        paises = result;
        io.emit("iniciaJuego", result);
        db.close();
      });
    });
  });

  cliente.on('ataque', batalla => {
    let paisA = Paises.buscarPais(paises, batalla.ataque);
    let paisD = Paises.buscarPais(paises, batalla.defensa);
    try{
    let resultado = Enfrentamiento.atacar(paisA, paisD);
    
    paisA.ejercitos -= Enfrentamiento.enfrentamientos(paisA, paisD) - resultado;
   
    paisD.ejercitos -= resultado;

    if (paisD.ejercitos < 1){
      paisA.ejercitos--;
      paisD.ejercitos = 1;
      paisD.jugador = paisA.jugador;

    }

    io.emit("resultadoAtaque", {ataque: paisA, defensa: paisD});
  }catch(e){
      cliente.emit('jugadaInvalida',e)
      }
  });
});

http.listen(3000, () => {
  console.log('puerto escucha *:3000');
});