const server = io('/salas')

function enviarNombre(nombre) {
    server.emit("nombre", nombre)
    
    server.on("salas", salas => {
        const ul = document.getElementById("salas")
        ul.innerHTML = ""
        for (let sala in salas) {
            if (salas[sala].nombre == nombre) {
                ul.innerHTML += `<li> ${sala} (Creador)<button id='${sala}' onclick='salir()'>Salir</button><button onclick="iniciar('${sala}')">Iniciar</button></li>`
            } else if (salas[sala].integrantes.indexOf(nombre) != -1) {
                ul.innerHTML += `<li> ${sala} (Unido)<button id='${sala}' onclick='salir()'>Salir</button></li>`
            } else {
                ul.innerHTML += `<li> ${sala} <button id='${sala}' onclick="unirse('${sala}')">Unirse</button></li>`
            }
        }
    })

    server.on("chatear", msg => {
        document.getElementById("chat").innerHTML += `<li>${msg}</li>`
    })

    server.on("iniciar", nombre => {
        const form = document.createElement("form")
        form.action = 'salaEspera'
        form.method = 'POST'
        document.body.appendChild(form)
        const nom = document.createElement("input")
        nom.value = nombre
        nom.name = "nombre"
        form.appendChild(nom)
        form.submit()
    })
}

document.getElementById("chatear").addEventListener("click", () => {
    server.emit("chatear", document.getElementById("linea").value)
})

document.getElementById("crear").addEventListener("click", () => {
    server.emit("crear")
})

function unirse(e) {
    server.emit("unirse", e)
}

function salir() {
    server.emit("salir")
}

function iniciar(e) {
    server.emit("iniciar", e)
}