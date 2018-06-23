const server = io();

const colores = ["ROJO", "VERDE", "AMARILLO", "AZUL", "NARANJA", "CELESTE"];

const inicio = document.getElementById("inicio");
inicio.addEventListener("click", iniciar);

function iniciar(){
    server.emit("inicio");
}

function enviarNombre(nombre){
    server.emit("nombre", nombre);
}

server.on("volverHome", home => {
    location = home;
});

server.on("listaJugadores", lista =>{
    let ul = document.getElementById("jugadores");
    for (let j of lista){
        ul.innerHTML += `<li>${j}</li>`;
    }
});

server.on("agregarJugador", nombre =>{
    let ul = document.getElementById("jugadores");
    ul.innerHTML += `<li>${nombre}</li>`
});

server.on("saleJugador", nombre =>{
    let ul = document.getElementById("jugadores");
    for (let l of ul.getElementsByTagName("li")){
        if (l.innerHTML == nombre){
            ul.removeChild(l);
        }
    }
});

server.on("resultadoAtaque", resultado =>{
    let div = document.getElementById("f" + resultado.ataque.id);
    div.innerHTML = `ejercitos:${resultado.ataque.ejercitos}`;
    div = document.getElementById("f" + resultado.defensa.id)
    div.innerHTML = `ejercitos:${resultado.defensa.ejercitos}`;
    let imagen =  document.getElementById(resultado.defensa.id);
   
});
server.on("jugadaInvalida", resultado =>{
  alert(resultado)
   
});

server.on("iniciaJuego", paises =>{
    inicio.style.display = "none";
    let mapa = document.getElementById("mapa");
    let imagen = new Image();
    imagen.src = "teg.jpg";
    imagen.id = "mundo";
    imagen.addEventListener("dragstart", allowDrop);
    mapa.appendChild(imagen);
    for (let pais of paises){
        imagen = new Image();
        imagen.src = `${colores[pais.jugador]}/${pais.archivo}`;
        imagen.id = pais.id;
        imagen.style.position = "absolute"
        imagen.style.left = pais.posX + "px";
        imagen.style.top = pais.posY+ "px";
        mapa.appendChild(imagen);
        imagen.addEventListener("dragstart", allowDrop);
        imagen.addEventListener("load", ev => {
            

            let fichas = document.createElement("div");
            fichas.id = "f" + pais.id;
            fichas.draggable = "true";
            fichas.addEventListener("dragover", allowDrop);
            fichas.addEventListener("dragstart", enfrentaA);
            fichas.addEventListener("drop", enfrentaD);
            fichas.style.position = "absolute";
            fichas.style.left = pais.posX + ev.target.width*.4+ "px";
            fichas.style.top = pais.posY + ev.target.height*.4+ "px";
            fichas.innerHTML = `ejercitos:${pais.ejercitos}`;
            mapa.appendChild(fichas);

            let misiles = document.createElement("div");
            misiles.id = "m"+ pais.id;
            misiles.draggable = "true";
            misiles.addEventListener("dragover", allowDrop);
            misiles.addEventListener("dragstart", misilA);
            misiles.addEventListener("drop", misilD);
            misiles.style.position = "absolute";
            misiles.style.left = pais.posX + ev.target.width*.4+ "px";
            misiles.style.top = pais.posY + ev.target.height*.6+ "px";
            misiles.innerHTML = `misiles:${pais.misiles}`;  
            mapa.appendChild(misiles);
        });
    }
});

function allowDrop(ev) {
    ev.preventDefault();
}

function enfrentaA(ev) {
    ev.dataTransfer.setData("ataque", ev.target.id.substr(1));
}

function enfrentaD(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.getData("ataque")){
        server.emit("ataque", {ataque: ev.dataTransfer.getData("ataque"), defensa: ev.target.id.substr(1)});
    }else {
        server.emit("misil", {ataque: ev.dataTransfer.getData("misil"), defensa: ev.target.id.substr(1)});
    }
}

function misilA(ev) {
    ev.dataTransfer.setData("misil", ev.target.id.substr(1));
}

function misilD(ev) {
    ev.preventDefault();
    server.emit("misil", {ataque: ev.dataTransfer.getData("misil"), defensa: ev.target.id.substr(1)});
    
}