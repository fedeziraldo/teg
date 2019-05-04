const mongoose = require('./mongooseTeg').mongoose
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const enfrentamiento = require("./enfrentamiento")
const PaisDto = require("./paisDto").PaisDto
const Pais = require("./paises").Pais
const Limite = require('./limites').Limite

const jugadores = []
let turno = 0
const clientes = {}

Pais.find((err, paises) => {
	if (err) return console.error(err)

	paisesDto = []
	for (pais of paises) {
		paisDto = new PaisDto(pais)
		paisDto.jugador = enfrentamiento.tirarDado() - 1
		paisesDto.push(paisDto)
	}

	Limite.find((err, limites) => {
		if (err) return console.error(err)
		for (limite of limites) {
			paises[limite.pais1 - 1].limites.push(paises[limite.pais2 - 1])
			paises[limite.pais2 - 1].limites.push(paises[limite.pais1 - 1])
		}
		cargaPaises = paises
	})
})

app.use(express.static(`${__dirname}/public`))

//extended: false significa que parsea solo string (no archivos de imagenes por ejemplo)
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'pug')
app.set('views', './views')

app.get('/', (req, res) => {
	res.render('index')
})

app.post('/registrar', (req, res) => {
	res.render('index', {
		mensaje: `usuario ${req.body.nombre} registrado`
	})
})

app.post('/entrar', (req, res) => {
	res.render('salaEspera', {
		nombre: req.body.nombre
	})
})

io.on('connection', cliente => {
	cliente.on('nombre', nombre => {
		clientes[nombre] = cliente
		console.log(`${nombre} conectado`)
		cliente.broadcast.emit("agregarJugador", nombre)
		cliente.emit("listaJugadores", Object.keys(clientes))
	})

	cliente.on('disconnect', () => {
		for (let attr in clientes) {
			if (clientes[attr] == cliente) {
				jugadores.splice(jugadores.indexOf(cliente), 1)
				console.log(`${attr} desconectado`)
				delete clientes[attr]
				io.emit("saleJugador", attr)
				break
			}
		}
	})

	cliente.on('inicio', () => {
		for (let jug in clientes) {
			jugadores.push(clientes[jug])
		}
		io.emit("iniciaJuego", paisesDto)
	})

	cliente.on('ataque', batalla => {
		const paisDtoA = paisesDto[batalla.ataque - 1]
		const paisDtoD = paisesDto[batalla.defensa - 1]
		try {
			validarTurno(cliente, paisDtoA)
			validarAtaque(paisDtoA, paisDtoD)
			if (!cargaPaises[batalla.ataque - 1].limita(cargaPaises[batalla.defensa - 1])) {
				throw ('no son limitrofes')
			}
			const dadosA = enfrentamiento.tirarDadosA(paisDtoA)
			const dadosD = enfrentamiento.tirarDadosD(paisDtoD)
			const enfrentamientos = enfrentamiento.enfrentamientos(paisDtoA, paisDtoD)
			const resultado = enfrentamiento.atacar(dadosA, dadosD, enfrentamientos)
			paisDtoD.ejercitos -= resultado
			paisDtoA.ejercitos -= enfrentamientos - resultado
			if (paisDtoD.ejercitos < 1) {
				paisDtoA.ejercitos--
				paisDtoD.ejercitos = 1
				paisDtoD.jugador = paisDtoA.jugador
			}
			io.emit('jugadaInvalida', "nose")
			io.emit("resultadoAtaque", { ataque: paisDtoA, defensa: paisDtoD })
		} catch (e) {
			cliente.emit('jugadaInvalida', e)
		}
	})

	cliente.on('misil', batalla => {
		const paisDtoA = paisesDto[batalla.ataque - 1]
		const paisDtoD = paisesDto[batalla.defensa - 1]
		try {
			validarTurno(cliente, paisDtoA)
			const daño = validarMisil(paisDtoA, paisDtoD)
			paisDtoD.ejercitos -= daño
			paisDtoA.misiles -= 1
			io.emit("resultadoMisil", { ataque: paisDtoA, defensa: paisDtoD })
		} catch (e) {
			cliente.emit('jugadaInvalida', e)
		}

	})
	cliente.on('pasarTurno', () => {
		try {
			pasarTurno(cliente)
		} catch (e) {
			cliente.emit('jugadaInvalida', e)
		}
	})
})

function validarTurno(cliente, paisDtoA) {
	if (jugadores[turno] != cliente) {
		throw ('no es tu turno')
	}
	if (turno != paisDtoA.jugador) {
		throw ('no es tu pais')
	}
}

function pasarTurno(cliente) {
	if (jugadores[turno] != cliente) {
		throw ('no podes pasar de turno')
	}
	turno++
}

function validarAtaque(paisDtoA, paisDtoD) {
	if (paisDtoA.ejercitos <= 1) {
		throw ('no hay suficiente ejercito')
	}
	if (paisDtoA.jugador == paisDtoD.jugador) {
		throw ('es el mismo jugador')
	}
}

function validarMisil(paisDtoA, paisDtoD) {
	if (paisDtoA.misiles < 1) {
		throw ('No hay misiles')
	}
	if (paisDtoA.jugador == paisDtoD.jugador) {
		throw ('es el mismo jugador')
	}
	if (paisDtoD.misiles >= 1) {
		throw ('no se puede lanzar misil a un pais con misiles')
	}
	const daño = 4 - cargaPaises[paisDtoA.id - 1].distancia(cargaPaises[paisDtoD.id - 1])
	if (paisDtoD.ejercitos <= daño) {
		throw ('no se puede matar un pais')
	}
	return daño
}

http.listen(3000, () => {
	console.log('puerto escucha *:3000')
})