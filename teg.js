const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const enfrentamiento = require("./enfrentamiento")
const paisDto = require("./paisDto")
const Pais = require("./paises").Pais
const Limite = require('./limites').Limite
const CartaGlobal = require('./cartaGlobales').CartaGlobal

const colores = ["ROJO", "VERDE", "AMARILLO", "AZUL", "NARANJA", "CELESTE"]
const jugadores = []
let turno = 0
const clientes = {}

let cargaPaises
let cargaCartaGlobales = []
const paisesDto = []

const FASE8 = 8
const FASE4 = 4
const MISILES = 6
let fase8 = true
let fase4 = false
let faseAtaque = false
let faseReagrupe = false
let faseRecarga = false
let captura = false
let fichas = FASE8

Pais.find((err, paises) => {
	if (err) return console.error(err)

	for (let pais of paises) {
		let paisDto2 = new paisDto.PaisDto(pais)
		paisesDto.push(paisDto2)
	}

	Limite.find((err, limites) => {
		if (err) return console.error(err)
		for (let limite of limites) {
			paises[limite.pais1 - 1].limites.push(paises[limite.pais2 - 1])
			paises[limite.pais2 - 1].limites.push(paises[limite.pais1 - 1])
		}
		cargaPaises = paises
	})
})

CartaGlobal.find((err, cartaGlobales) => {
	if (err) return console.error(err)
	for (let cartaGlobal of cartaGlobales) {
		for (let i = 0; i < cartaGlobal.cantidad; i++) {
			cargaCartaGlobales.push(cartaGlobal)
		}
	}
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
		cliente.nombre = nombre
		console.log(`${nombre} conectado`)
		cliente.broadcast.emit("agregarJugador", nombre)
		cliente.emit("listaJugadores", Object.keys(clientes))
	})

	cliente.on('disconnect', () => {
		for (let nombre in clientes) {
			if (clientes[nombre] == cliente) {
				jugadores.splice(jugadores.indexOf(cliente), 1)
				console.log(`${nombre} desconectado`)
				delete clientes[nombre]
				io.emit("saleJugador", nombre)
				break
			}
		}
	})

	cliente.on('inicio', () => {
		for (let nombre in clientes) {
			jugadores.push(clientes[nombre])
		}
		for (let i = 0; i < paisesDto; i++) {
			paisesDto[i].jugador = i % jugadores.length
		}
		io.emit("iniciaJuego", paisesDto)
	})

	cliente.on('ataque', ataque => {
		const paisDtoA = paisesDto[ataque.ataque - 1]
		const paisDtoD = paisesDto[ataque.defensa - 1]
		try {
			validarTurno(cliente, paisDtoA)
			const distancia = validarAtaque(paisDtoA, paisDtoD)
			if (distancia == 0) {
				validarFaseRecarga()
				paisDtoA.ejercitos -= MISILES
				paisDtoD.misiles++
			} else if (distancia != 1) {
				throw ("no son limitrofes")
			} else if (paisDtoA.jugador == paisDtoD.jugador) {
				validarFaseReagrupe()
				paisDtoA.ejercitos--
				paisDtoD.ejercitos++
			} else {
				validarFaseAtaque()
				const dadosA = enfrentamiento.tirarDadosA(paisDtoA)
				const dadosD = enfrentamiento.tirarDadosD(paisDtoD)
				const enfrentamientos = enfrentamiento.enfrentamientos(paisDtoA, paisDtoD)
				const resultado = enfrentamiento.atacar(dadosA, dadosD, enfrentamientos)
				paisDtoD.ejercitos -= resultado
				paisDtoA.ejercitos -= enfrentamientos - resultado
				if (paisDtoD.ejercitos < 1) {
					paisDtoA.ejercitos--
					paisDtoD.ejercitos++
					paisDtoD.jugador = paisDtoA.jugador
				}
			}
		} catch (e) {
			cliente.emit('jugadaInvalida', e)
		}
		io.emit("resultadoAtaque", { ataque: paisDtoA, defensa: paisDtoD })
	})

	cliente.on('misil', misil => {
		const paisDtoA = paisesDto[misil.ataque - 1]
		const paisDtoD = paisesDto[misil.defensa - 1]
		try {
			validarTurno(cliente, paisDtoA)
			const distancia = validarMisil(paisDtoA, paisDtoD)
			if (paisDtoA == paisDtoD) {
				validarFaseRecarga()
				paisDtoD.ejercitos += MISILES
				paisDtoA.misiles--
			} else if (paisDtoA.jugador == paisDtoD.jugador) {
				validarFaseReagrupe()
				paisDtoD.misiles++
				paisDtoA.misiles--
			} else {
				validarFaseAtaque()
				const daño = 4 - distancia
				if (paisDtoD.ejercitos <= daño) {
					throw ("no se puede matar un pais")
				}
				paisDtoA.misiles--
				paisDtoD.ejercitos -= daño
			}
			io.emit("resultadoMisil", { ataque: paisDtoA, defensa: paisDtoD })
		} catch (e) {
			cliente.emit('jugadaInvalida', e)
		}

	})
	cliente.on('pasarTurno', () => {
		try {
			validarTurno(cliente)
			if (fichas > 0) {
				throw ("quedan fichas")
			}
			if (faseAtaque) {
				faseAtaque = false
				faseReagrupe = true
			} else if (faseReagrupe) {
				faseReagrupe = false
				faseAtaque = true
				turno++
			}
			if (turno % jugadores.length == 0) {
				if (fase8) {
					fase8 = false
					fase4 = true
					fichas = FASE4
				} else if (fase4) {
					fase4 = false
					faseAtaque = true
				} else if (faseReagrupe) {
					faseReagrupe = false
					faseAtaque = false
					faseRecarga = true
					fichas = parseInt(paisDto.paisesJugador(turno % jugadores.length) / 2)
				} else if (faseRecarga) {
					faseRecarga = false
					faseAtaque = true
				}
			} else {
				if (fase8) {
					fichas = FASE8
				} else if (fase4) {
					fichas = FASE4
				} else if (faseRecarga) {
					fichas = parseInt(paisDto.paisesJugador(turno % jugadores.length) / 2)
				}
			}
		} catch (e) {
			cliente.emit('jugadaInvalida', e)
		}
	})
	cliente.on('ponerFicha', idPais => {
		const paisDto = paisesDto[idPais - 1]
		try {
			validarTurno(cliente, paisDto)
			valudarFaseRecarga()
			if (fichas <= 0) {
				throw ("no quedan fichas para poner")
			}
			paisDto.ejercitos++
			fichas--
			io.emit("ponerPais", paisDto)
		} catch (e) {
			cliente.emit('jugadaInvalida', e)
		}
	})
	cliente.on('ponerMisil', idPais => {
		const paisDto = paisesDto[idPais - 1]
		try {
			validarTurno(cliente, paisDto)
			valudarFaseRecarga()
			if (fichas <= MISILES) {
				throw ("no hay suficientes fichas")
			}
			paisDto.misiles++
			fichas -= MISILES
			io.emit("ponerPais", paisDto)
		} catch (e) {
			cliente.emit('jugadaInvalida', e)
		}
	})
})

function validarTurno(cliente, paisDto) {
	if (jugadores[turno % jugadores.length] != cliente) {
		throw ('no es tu turno')
	}
	if (paisDto && turno % jugadores.length != paisDto.jugador) {
		throw ('no es tu pais')
	}
}

function validarAtaque(paisDtoA, paisDtoD) {
	if (paisDtoA.ejercitos <= 1) {
		throw ('no hay suficiente ejercito')
	}
	return cargaPaises[paisDtoA.id - 1].distancia(cargaPaises[paisDtoD.id - 1])
}

function validarMisil(paisDtoA, paisDtoD) {
	if (paisDtoA.misiles < 1) {
		throw ('No hay misiles')
	}
	return cargaPaises[paisDtoA.id - 1].distancia(cargaPaises[paisDtoD.id - 1])
}

function valudarFaseRecarga() {
	if (!faseRecarga){
		throw ("no se puede poner fichas ahora")
	}
}

function validarFaseAtaque() {
	if (!faseAtaque){
		throw ("no se puede atacar ahora")
	}
}

function validarFaseRecarga() {
	if (!faseRecarga){
		throw ("no se puede comprar o vender misiles ahora")
	}
}

function validarFaseReagrupe() {
	if (!faseReagrupe){
		throw ("no se puede trasladar ejercitos ni misiles")
	}
}

function copiar(vector) {
	aux = []
	for (let elem of vector) {
		aux.push(elem)
	}
	return aux
}

function desordenar(vector) {
	for (let i = 0; i < vector.length; i++) {
		for (let j = 0; j < vector.length; j++) {
			if (Math.floor(Math.random() * 2) == 0) {
				let aux = vector[i]
				vector[i] = vector[j]
				vector[j] = aux
			}
		}
	}
}

http.listen(3000, () => {
	console.log('puerto escucha *:3000')
})