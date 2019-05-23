const server = io()

const inicio = document.getElementById("inicio")
inicio.addEventListener("click", iniciar)

function iniciar() {
    server.emit("inicio")
}

function enviarNombre(nombre) {
    server.emit("nombre", nombre)
}

server.on("listaJugadores", lista => {
    let ul = document.getElementById("jugadores")
    ul.innerHTML = ""
    for (let j of lista) {
        ul.innerHTML += `<li>${j}</li>`
    }
})

server.on("agregarJugador", nombre => {
    document.getElementById("jugadores").innerHTML += `<li>${nombre}</li>`
})

server.on("resultado", resultado => {
    let imagen = document.getElementById(resultado.defensa.id)
    imagen.src = `${resultado.defensa.jugador}/${resultado.defensa.archivo}`
    document.getElementById("f" + resultado.ataque.id).innerHTML = `ejercitos:${resultado.ataque.ejercitos}`
    document.getElementById("m" + resultado.ataque.id).innerHTML = `misiles:${resultado.ataque.misiles}`
    document.getElementById("f" + resultado.defensa.id).innerHTML = `ejercitos:${resultado.defensa.ejercitos}`
    document.getElementById("m" + resultado.defensa.id).innerHTML = `misiles:${resultado.defensa.misiles}`
})

server.on("jugadaInvalida", resultado => {
    alert(resultado)

})

server.on("iniciaJuego", paises => {
    const mapa = document.getElementById("teg")
    const botonPasarTurno = document.createElement('button')
    botonPasarTurno.addEventListener('click', pasarTurno)
    botonPasarTurno.innerHTML = 'Pasar Turno'
    document.body.appendChild(botonPasarTurno)
    const botonCanjear = document.createElement('button')
    botonCanjear.addEventListener('click', canjear)
    botonCanjear.innerHTML = 'Canjear'
    document.body.appendChild(botonCanjear)
    inicio.style.display = "none"

    let imagen = new Image()
    imagen.src = "teg.jpg"
    imagen.draggable = false
    mapa.appendChild(imagen)
    for (let pais of paises) {
        imagen = new Image()
        imagen.src = `${pais.jugador}/${pais.archivo}`
        imagen.id = pais.id
        imagen.draggable = false
        imagen.alt = pais.nombre
        imagen.style.position = "absolute"
        imagen.style.left = pais.posX + "px"
        imagen.style.top = pais.posY + "px"
        mapa.appendChild(imagen)
        imagen.addEventListener("load", ev => {

            if (document.getElementById("f" + pais.id)) {
                return
            }

            let fichas = document.createElement("div")
            fichas.id = "f" + pais.id
            fichas.draggable = true
            fichas.addEventListener("click", ponerFicha)
            fichas.addEventListener("dragover", allowDrop)
            fichas.addEventListener("dragstart", ataqueA)
            fichas.addEventListener("drop", enfrentaD)
            fichas.style.left = pais.posX + ev.target.width * .3 + "px"
            fichas.style.top = pais.posY + ev.target.height * .4 + "px"
            fichas.innerHTML = `ejercitos:${pais.ejercitos}`
            mapa.appendChild(fichas)

            let misiles = document.createElement("div")
            misiles.id = "m" + pais.id
            misiles.draggable = true
            misiles.addEventListener("click", ponerMisil)
            misiles.addEventListener("dragover", allowDrop)
            misiles.addEventListener("dragstart", misilA)
            misiles.addEventListener("drop", enfrentaD)
            misiles.style.left = fichas.style.left
            misiles.style.top = pais.posY + ev.target.height * .4 + 15 + "px"
            misiles.innerHTML = `misiles:${pais.misiles}`;
            mapa.appendChild(misiles)
        })
    }
})

server.on("ponerPais", pais => {
    document.getElementById("f" + pais.id).innerHTML = `ejercitos:${pais.ejercitos}`
    document.getElementById("m" + pais.id).innerHTML = `misiles:${pais.misiles}`
})

server.on("jugadores", jugadores => {
    let ul = document.getElementById("jugadores")
    ul.innerHTML = ""
    for (let jugador of jugadores) {
        ul.innerHTML += `<li>${jugador.nombre} (${jugador.color})</li>`
    }
})

server.on("turno", nombre => {
    document.getElementById("turno").innerHTML = `le toca a ${nombre}`
})

server.on("objetivo", jugador => {
    document.getElementById("objetivo").innerHTML = `${jugador.objetivo.nombre}`
    document.getElementById("cartaPais").innerHTML = ""
    for (let carta of jugador.cartasPais) {
        document.getElementById("cartaPais").innerHTML += `<li name="${carta.id}"><input type="checkbox"/>${carta.nombre} (${carta.escudo})</li>`
    }
    document.getElementById("cartaContinente").innerHTML = ""
    for (let carta of jugador.cartasContinente) {
        document.getElementById("cartaContinente").innerHTML += `<li name="${carta.id}"><input type="checkbox"/>${carta.nombre} (${carta.fichas}) (${carta.escudo})</li>`
    }
})

server.on("cartaGlobal", cartaGlobal => {
    document.getElementById("cartaGlobal").innerHTML = cartaGlobal.tipo
})

server.on("dadosA", dadosA => {
    document.getElementById("dadosA").innerHTML = dadosA
})

server.on("dadosD", dadosD => {
    document.getElementById("dadosD").innerHTML = dadosD
})

function allowDrop(ev) {
    ev.preventDefault()
}

function ataqueA(ev) {
    ev.dataTransfer.setData("ataque", ev.target.id.substr(1))
}

function enfrentaD(ev) {
    ev.preventDefault()
    if (ev.dataTransfer.getData("ataque")) {
        server.emit("ataque", { ataque: ev.dataTransfer.getData("ataque"), defensa: ev.target.id.substr(1) })
    } else {
        server.emit("misil", { ataque: ev.dataTransfer.getData("misil"), defensa: ev.target.id.substr(1) })
    }
}

function misilA(ev) {
    ev.dataTransfer.setData("misil", ev.target.id.substr(1))
}
function pasarTurno() {
    server.emit('pasarTurno')
}
function ponerFicha(ev) {
    server.emit('ponerFicha', ev.target.id.substr(1))
}
function ponerMisil(ev) {
    server.emit('ponerMisil', ev.target.id.substr(1))
}

function canjear() {
    const paises = []
    const continentes = []
    for (let pais of document.getElementById("cartaPais").children) {
        paises.push(pais.name)
    }
    for (let continente of document.getElementById("cartaContinente").children) {
        continentes.push(continente.name)
    }
    server.emit("canjear", {paises, continentes})
}