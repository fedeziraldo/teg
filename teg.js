const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const enfrentamiento = require("./enfrentamiento")
const PaisDto = require("./paisDto").PaisDto
const JugadorDto = require("./jugadorDto").JugadorDto
const Pais = require("./modelos/paises").Pais
const Limite = require('./modelos/limites').Limite
const CartaGlobal = require('./modelos/cartaGlobales').CartaGlobal
const Continente = require('./modelos/continentes').Continente
const Objetivo = require('./modelos/objetivos').Objetivo
const Escudo = require('./modelos/escudos').Escudo

const colores = ["ROJO", "VERDE", "AMARILLO", "AZUL", "NARANJA", "CELESTE"]

let cargaPaises
let cargaEscudos
const jugadores = []
const jugadorDtos = []
const paisesDto = []
const clientes = {}

let turno = 0
let cartaGlobal

const mazoPaisesDto = []
const mazoCartaGlobales = []
let mazoContinentes
let mazoObjetivos = []

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

	Limite.find((err, limites) => {
		if (err) return console.error(err)
		for (let limite of limites) {
			paises[limite.pais1 - 1].limites.push(paises[limite.pais2 - 1])
			paises[limite.pais2 - 1].limites.push(paises[limite.pais1 - 1])
		}
		cargaPaises = paises

		for (let pais of paises) {
			const paisDto = new PaisDto(pais)
			paisesDto.push(paisDto)
			for (let limite of pais.limites) {
				paisDto.limites.push(limite.id)
			}
		}
		mazoPaisesDto.push(...paisesDto)
		desordenar(mazoPaisesDto)
	})

	Escudo.find((err, escudos) => {
		if (err) return console.error(err)
		cargaEscudos = escudos
	})

	Continente.find((err, continentes) => {
		if (err) return console.error(err)
		mazoContinentes = continentes
	})
})

CartaGlobal.find((err, cartaGlobales) => {
	if (err) return console.error(err)
	for (let cartaGlobal of cartaGlobales) {
		for (let i = 0; i < cartaGlobal.cantidad; i++) {
			mazoCartaGlobales.push(cartaGlobal)
		}
		if (!cartaGlobal.ataque) cartaGlobal.ataque = 0
		if (!cartaGlobal.defensa) cartaGlobal.defensa = 0
	}
	desordenar(mazoCartaGlobales)
})

Objetivo.find((err, objetivos) => {
	if (err) return console.error(err)
	mazoObjetivos = desordenar(objetivos)
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
				jugadorDtos.splice(jugadores.indexOf(cliente), 1)
				jugadores.splice(jugadores.indexOf(cliente), 1)
				console.log(`${nombre} desconectado`)
				delete clientes[nombre]
				io.emit("saleJugador", nombre)
				break
			}
		}
	})

	cliente.on('inicio', () => {
		desordenar(colores)
		for (let nombre in clientes) {
			jugadores.push(clientes[nombre])
			jugadorDtos.push(new JugadorDto(colores[jugadorDtos.length], nombre))
		}
		io.emit("jugadores", jugadorDtos)
		for (let i = 0; i < jugadorDtos.length; i++) {
			jugadorDtos[i].objetivo = mazoObjetivos.pop()
			jugadores[i].emit("objetivo", jugadorDtos[i].objetivo)
		}
		for (let i = 0; i < mazoPaisesDto.length; i++) {
			mazoPaisesDto[i].jugador = jugadorDtos[i % jugadorDtos.length].color
		}
		io.emit("iniciaJuego", paisesDto)
		io.emit("turno", jugadorDtos[turno % jugadorDtos.length].nombre)
		desordenar(mazoPaisesDto)
	})

	cliente.on('ataque', ataque => {
		const paisDtoA = paisesDto[ataque.ataque - 1]
		const paisDtoD = paisesDto[ataque.defensa - 1]
		try {
			validarTurno(cliente, paisDtoA)
			const distancia = validarAtaque(paisDtoA, paisDtoD)
			if (distancia == 0) {
				validarFaseRecargaMisiles()
				if (paisDtoA.ejercitos <= MISILES) {
					throw ("no hay suficiente para comprar misiles")
				}
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
				if (cartaGlobal.fronteraAbierta && paisDtoA.continente == paisDtoD.continente) {
					throw ("en fronteras abiertas hay que atacar fuera del continente")
				}
				if (cartaGlobal.fronteraCerrada && paisDtoA.continente != paisDtoD.continente) {
					throw ("en fronteras cerradas hay que atacar dentro del continente")
				}
				const ejercitosA = paisDtoA.ejercitos
				const ejercitosD = paisDtoD.ejercitos
				const dadosA = enfrentamiento.tirarDadosA(ejercitosA, ejercitosD, cartaGlobal.ataque)
				io.emit("dadosA", dadosA)
				const dadosD = enfrentamiento.tirarDadosD(ejercitosD, cartaGlobal.defensa)
				io.emit("dadosD", dadosD)
				const enfrentamientos = enfrentamiento.enfrentamientos(ejercitosA, ejercitosD)
				const resultado = enfrentamiento.atacar(dadosA, dadosD, enfrentamientos)
				paisDtoD.ejercitos -= resultado
				paisDtoA.ejercitos -= enfrentamientos - resultado
				if (paisDtoD.ejercitos < 1) {
					jugadorDtos[turno % jugadorDtos.length].paisesCapturadosRonda++
					paisDtoA.ejercitos--
					paisDtoD.ejercitos++
					paisDtoD.jugador = paisDtoA.jugador
				}
			}
			io.emit("resultado", { ataque: paisDtoA, defensa: paisDtoD })
		} catch (e) {
			console.log(e)
			cliente.emit('jugadaInvalida', e)
		}
	})

	cliente.on('misil', misil => {
		const paisDtoA = paisesDto[misil.ataque - 1]
		const paisDtoD = paisesDto[misil.defensa - 1]
		try {
			validarTurno(cliente, paisDtoA)
			const distancia = validarMisil(paisDtoA, paisDtoD)
			if (distancia == 0) {
				validarFaseRecargaMisiles()
				paisDtoD.ejercitos += MISILES
				paisDtoA.misiles--
			} else if (distancia != 1 && paisDtoA.jugador == paisDtoD.jugador) {
				throw ("no son limitrofes")
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
				if (paisDtoA.misiles <= paisDtoD.misiles) {
					throw ("no se puede tirar misil con menos paises que el otro ")
				}
				io.emit("dadosA", "lanza un misil")
				paisDtoA.misiles--
				paisDtoD.ejercitos -= daño
			}
			io.emit("resultado", { ataque: paisDtoA, defensa: paisDtoD })
		} catch (e) {
			console.log(e)
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
				return
			}
			if (faseReagrupe) {
				if (jugadorDtos[turno % jugadorDtos.length].puedeSacarCarta()) {
					const carta = mazoPaisesDto.splice(0, 1)[0]
					jugadorDtos[turno % jugadorDtos.length].cartasPais.push(carta)
					cliente.emit("cartaPais", carta)
					if (carta.jugador == jugadorDtos[turno % jugadorDtos.length]) {
						carta.ejercitos += 3
						io.emit("ponerPais", carta)
					}
				}
				jugadorDtos[turno % jugadorDtos.length].paisesCapturadosRonda = 0
			}
			turno++
			if (turno % jugadores.length == 0) {
				if (fase8) {
					fase8 = false
					fase4 = true
					fichas = FASE4
				} else if (fase4) {
					fase4 = false
					faseAtaque = true
					cartaGlobal = mazoCartaGlobales.pop()
					io.emit("cartaGlobal", cartaGlobal)
				} else if (faseReagrupe) {
					faseReagrupe = false
					faseRecarga = true
					fichas = parseInt(jugadorDtos[turno % jugadorDtos.length].paisesJugador(paisesDto).length / 2)
				} else if (faseRecarga) {
					faseRecarga = false
					faseAtaque = true
					cartaGlobal = mazoCartaGlobales.pop()
					io.emit("cartaGlobal", cartaGlobal)
				}
			} else {
				if (fase8) {
					fichas = FASE8
				} else if (fase4) {
					fichas = FASE4
				} else if (faseReagrupe) {
					faseReagrupe = false
					faseAtaque = true
				} else if (faseRecarga) {
					fichas = parseInt(jugadorDtos[turno % jugadorDtos.length].paisesJugador(paisesDto).length / 2)
				}
			}
			io.emit("turno", jugadorDtos[turno % jugadorDtos.length].nombre)
		} catch (e) {
			console.log(e)
			cliente.emit('jugadaInvalida', e)
		}
	})
	cliente.on('ponerFicha', idPais => {
		const paisDto = paisesDto[idPais - 1]
		try {
			validarTurno(cliente, paisDto)
			validarFaseRecarga()
			if (fichas <= 0) {
				throw ("no quedan fichas para poner")
			}
			validarBloqueo(paisDto)
			paisDto.ejercitos++
			fichas--
			io.emit("ponerPais", paisDto)
		} catch (e) {
			console.log(e)
			cliente.emit('jugadaInvalida', e)
		}
	})
	cliente.on('ponerMisil', idPais => {
		const paisDto = paisesDto[idPais - 1]
		try {
			validarTurno(cliente, paisDto)
			validarFaseRecargaMisiles()
			if (fichas <= MISILES) {
				throw ("no hay suficientes fichas")
			}
			validarBloqueo(paisDto)
			paisDto.misiles++
			fichas -= MISILES
			io.emit("ponerPais", paisDto)
		} catch (e) {
			console.log(e)
			cliente.emit('jugadaInvalida', e)
		}
	})
})

function validarTurno(cliente, paisDto) {
	if (jugadores[turno % jugadores.length] != cliente) {
		throw ('no es tu turno')
	}
	if (paisDto && jugadorDtos[turno % jugadorDtos.length].color != paisDto.jugador) {
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

function validarFaseAtaque() {
	if (!faseAtaque) {
		throw ("no se puede atacar ahora")
	}
}

function validarFaseRecargaMisiles() {
	if (!faseRecarga) {
		throw ("no se puede poner fichas ni comprar o vender misiles ahora")
	}
}

function validarFaseRecarga() {
	if (!(faseRecarga || fase8 || fase4)) {
		throw ("no se puede poner fichas ahora")
	}
}

function validarFaseReagrupe() {
	if (!faseReagrupe) {
		throw ("no se puede trasladar ejercitos ni misiles")
	}
}

function validarBloqueo(paisDto) {
	const limites = []
	limites.push(...paisDto.limites)
	for (let i = 0; i < limites.length; i++) {
		limites[i] = paisesDto[limites[i] - 1]
	}
	if (paisDto.bloqueado(limites)) {
		throw ("el pais esta bloqueado")
	}
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
	return vector
}

http.listen(3000, () => {
	console.log('puerto escucha *:3000')
})