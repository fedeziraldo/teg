const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
jugadores=[];
turno=0;
const Enfrentamiento = require("./enfrentamiento");
const CartaGlobal = require("./cartaGlobal");
const Paises = require("./pais");

const url = "mongodb://localhost:27017/";
const nombredb = "fede";
const clientes = {};


MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
  if (err) throw err;
  let dbo = db.db(nombredb);
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
    let dbo = db.db(nombredb);
    let query = { nombre: req.body.nombre };
    dbo.collection("jugador").findOne(query, (err, result) => {
      if (err) throw err;
      if (result == null){
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
          if (err) throw err;
          let dbo = db.db(nombredb);
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
    let dbo = db.db(nombredb);
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
      let dbo = db.db(nombredb);
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
        jugadores.splice(jugadores.indexOf(cliente), 1);
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
          if (err) throw err;
          let dbo = db.db(nombredb);
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
    Paises.cargarPaises(url, nombredb, io, clientes);
    CartaGlobal.cargarCartasGlobales(url, nombredb, io);
    for(let jug in clientes){
      jugadores.push(clientes[jug]);
    }
  });

  cliente.on('ataque', batalla => {
    let paisA = Paises.buscarPais(batalla.ataque);
    let paisD = Paises.buscarPais(batalla.defensa);
    try{
          if(jugadores[turno] != cliente){
            throw('no es tu turno');
          }
          if(turno!==ullpaisA.jugador){
            throw('no es tu pais')
          }
          
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

  cliente.on('misil', batalla => {
    let paisA = Paises.buscarPais(batalla.ataque);
    let paisD = Paises.buscarPais(batalla.defensa);
    try{
      if(jugadores[turno] != cliente){
        throw('no es tu turno');
      }
      if(turno!=paisA.jugador){
        throw('no es tu pais')
      }
      let daño=Enfrentamiento.enfrentamientoMisil(paisA,paisD);
      paisD.ejercitos -=  daño;
      paisA.misiles-=1;
    io.emit("resultadoMisil", {ataque: paisA, defensa: paisD});
  }catch(e){
      cliente.emit('jugadaInvalida',e)
      }
      
  });
  cliente.on('pasarTurno',()=>{
    try{
    pasarTurno(cliente);
    }catch(e){
      cliente.emit('jugadaInvalida',e)
    }
  });
});
 

http.listen(3000, () => {
  console.log('puerto escucha *:3000');
});

function pasarTurno(cliente){
  noPuedePasarturno(cliente)

    turno++
  }
  function noPuedePasarturno(cliente){
    if(jugadores[turno]!=cliente)
      throw('no podes pasar de turno');
    }
  

   
  function terminarRonda(){
    if(finDeRonda){
      this.jugadores.unshift(this.jugadores.pop())
      turno=0;
  } 
  }

exports.pasarTurno=pasarTurno;