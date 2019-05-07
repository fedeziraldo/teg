const server = io()

const colores = ["ROJO", "VERDE", "AMARILLO", "AZUL", "NARANJA", "CELESTE"]

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
    for (let j of lista) {
        ul.innerHTML += `<li>${j}</li>`
    }
})

server.on("agregarJugador", nombre => {
    let ul = document.getElementById("jugadores")
    ul.innerHTML += `<li>${nombre}</li>`
})

server.on("saleJugador", nombre => {
    let ul = document.getElementById("jugadores")
    for (let l of ul.getElementsByTagName("li")) {
        if (l.innerHTML == nombre) {
            ul.removeChild(l)
        }
    }
})

server.on("resultadoAtaque", resultado => {
    let imagen = document.getElementById(resultado.defensa.id)
    imagen.src = `${colores[resultado.defensa.jugador]}/${resultado.defensa.archivo}`
    document.getElementById("f" + resultado.ataque.id).innerHTML = `ejercitos:${resultado.ataque.ejercitos}`
    document.getElementById("f" + resultado.defensa.id).innerHTML = `ejercitos:${resultado.defensa.ejercitos}`
})
server.on("resultadoMisil", resultado => {
    document.getElementById("f" + resultado.ataque.id).innerHTML = `ejercitos:${resultado.ataque.ejercitos}`
    document.getElementById("m" + resultado.ataque.id).innerHTML = `misiles:${resultado.ataque.misiles}`
    document.getElementById("f" + resultado.defensa.id).innerHTML = `ejercitos:${resultado.defensa.ejercitos}`
    document.getElementById("m" + resultado.defensa.id).innerHTML = `misiles:${resultado.defensa.misiles}`

})
server.on("jugadaInvalida", resultado => {
    alert(resultado)

})

server.on("iniciaJuego", paises => {
    let mapa = document.getElementById("mapa")
    botonPasarTurno = document.createElement('button')
    document.body.appendChild(botonPasarTurno)
    botonPasarTurno.addEventListener('click', pasarTurno)
    botonPasarTurno.innerHTML = 'Pasar Turno'
    inicio.style.display = "none"

    let imagen = new Image()
    imagen.src = "teg.jpg"
    imagen.id = "teg"
    mapa.appendChild(imagen)
    for (let pais of paises) {
        imagen = new Image()
        imagen.src = `${colores[pais.jugador]}/${pais.archivo}`
        imagen.id = pais.id
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
            fichas.draggable = "true"
            fichas.addEventListener("click", ponerFicha)
            fichas.addEventListener("dragover", allowDrop)
            fichas.addEventListener("dragstart", ataqueA)
            fichas.addEventListener("drop", enfrentaD)
            fichas.style.position = "absolute"
            fichas.style.left = pais.posX + ev.target.width * .2 + "px"
            fichas.style.top = pais.posY + ev.target.height * .4 + "px"
            fichas.innerHTML = `ejercitos:${pais.ejercitos}`
            mapa.appendChild(fichas)

            let misiles = document.createElement("div")
            misiles.id = "m" + pais.id
            misiles.draggable = "true"
            misiles.addEventListener("dragover", allowDrop)
            misiles.addEventListener("dragstart", misilA)
            misiles.addEventListener("drop", enfrentaD)
            misiles.style.position = "absolute"
            misiles.style.left = pais.posX + ev.target.width * .2 + "px"
            misiles.style.top = pais.posY + ev.target.height * .6 + "px"
            misiles.innerHTML = `misiles:${pais.misiles}`;
            mapa.appendChild(misiles)
        })
    }
})

server.on("ponerPais", pais => {
    document.getElementById("f" + pais.id).innerHTML = `ejercitos:${pais.ejercitos}`
    document.getElementById("m" + pais.id).innerHTML = `misiles:${pais.ejercitos}`
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