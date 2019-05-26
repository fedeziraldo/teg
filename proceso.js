var express = require('express');
var app = express();
var express = require('express');
var bodyParser = require('body-parser');

const paises = require('./modelos/paises').Pais
const continente = require('./modelos/continentes').Continente
const escudo = require('./modelos/escudos').Escudo


app.set('view engine', 'pug');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data





app.get('/proceso', function(req, res){
  
    var promises = [ paises.find().populate('continente').populate('escudo').exec(), 
       continente.find().exec(),
        escudo.find().exec()]; 
            Promise.all(promises).then(function(results) { console.log(results)
            res.render('proceso',{results})  }).catch(function(err){ console.log(err); }); 
                
});
app.post('/proceso', function(req, res){
    var id=req.body._id
    var continente=req.body.continenteSeleccionado
    var escudo=req.body.escudoSeleccionado
    paises.findById(id,function(err,result){
        result.continente=continente;
        result.escudo=escudo

        result.save(function(err,result){
            console.log(result)
            res.redirect('/proceso')
        })
    }
    )
 });


 app.get('/procesopais', function(req, res){
  
    var promises = [
       continente.find().populate('escudo').exec(),
        escudo.find().exec()]; 
            Promise.all(promises).then(function(results) { console.log(results)
            res.render('procesopais',{results})  }).catch(function(err){ console.log(err); }); 
                
});
app.post('/procesopais', function(req, res){
    var id=req.body._id
   
    var escudo=req.body.escudoSeleccionado

    continente.findById(id,function(err,result){
        
        result.escudo=escudo

        result.save(function(err,result){
            console.log(result)
            res.redirect('/procesopais')
        })
    }
    )
 });

app.listen(4000);