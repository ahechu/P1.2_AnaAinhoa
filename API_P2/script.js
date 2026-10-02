const API = "http://localhost:3000";

// GET Buscar peliculas /peliculas?nombre=Titanic

document.getElementById("buscarPelicula").addEventListener("click", async function () {
    const nombre = document.getElementById("buscarNombre").value;   // Cogemos el nombre escrito en el input
    const resultado = document.getElementById("resultado");         // Lugar donde vamos a mostrar el resultado

    if (nombre === "") {
        resultado.innerHTML = "Escribe el nombre de una película"; // en caso de que no se escriba nada
        return;
    }

    try {
        const respuesta = await fetch(
            API + "/peliculas?nombre=" + encodeURIComponent(nombre) //cambia el formato del nombre para que sea válido en la URL
        );
        if (respuesta.ok) {
            const pelicula = await respuesta.json();     // La respuesta en json la mostramos en un objeto de Javascript
            resultado.innerHTML =                           // Mostramos los datos de la película
                "<h3>" + pelicula.nombre + "</h3>" +
                "<p>ID: " + pelicula.id + "</p>" +
                "<p>Año: " + pelicula.ano + "</p>" +
                "<p>Actores: " + pelicula.actores.join(", ") + "</p>";
        } else {
            const error = await respuesta.text();   // Si la peluicula no existe o no es correcta --> devuelve el error en texto
            resultado.innerHTML = error;
        }
    } catch (error) {
        resultado.innerHTML = "Error al conectar con la API";
        console.log(error);
    }
});

// POST Crear peliculas /peliculas

document.getElementById("crearPelicula").addEventListener("click", async function () {
    const nombre = document.getElementById("peliculaNombre").value;  
    const ano = document.getElementById("peliculaAno").value;
    const textoActores = document.getElementById("peliculaActores").value;
    let actores = [];                           // Creamos un array vacío
    if (textoActores !== "") {                  // Si se han escrito actores, los separamos por las comas
        actores = textoActores.split(",");
        actores = actores.map(function (actor) {  // con .map hacemos un bucle por cada actor del array
            return actor.trim(); // Dentro de la función map, hacemos trim a cada actor para quitar los espacios.
        });
    }

    const pelicula = {
        nombre: nombre,
        ano: Number(ano),
        actores: actores // metemos el array de actores creado 
    };

    try {
        const respuesta = await fetch(API + "/peliculas", {         // Hacemos la petición POST
            method: "POST",
            headers: {                                              
                "Content-Type": "application/json" // Formato en json 
            },
            body: JSON.stringify(pelicula)   // Convertimos el objeto pelicula en un JSON para enviarlo al servidor                       
        });
        if (respuesta.ok) {
            const datos = await respuesta.json();        
            document.getElementById("mensaje").innerHTML =
                "Película creada : " + datos.nombre + "(ID:" + datos.id + ")"; 
        } else {
            const error = await respuesta.text(); 
            document.getElementById("mensaje").innerHTML = error;
        }
    } catch (error) {
        document.getElementById("mensaje").innerHTML =
            "Error al conectar con la API";
        console.log(error);
    }
});

// PUT Modificar peliculas /peliculas/:id

document.getElementById("modificarPelicula").addEventListener("click", async function () {
    const id = document.getElementById("modificarPeliculaId").value;
    const nombre = document.getElementById("modificarPeliculaNombre").value;
    const ano = document.getElementById("modificarPeliculaAno").value;
    const textoActores = document.getElementById("modificarPeliculaActores").value;
    const cambios = {}; // Creamos un objeto vacío donde guardaremos los cambios

    if (nombre !== "") {
        cambios.nombre = nombre;
    }

    if (ano !== "") {
        cambios.ano = Number(ano);
    }

    if (textoActores !== "") {
        let actores = textoActores.split(",");
        actores = actores.map(function (actor) {
            return actor.trim();
        });
        cambios.actores = actores;
    }

    try {
        const respuesta = await fetch(
            API + "/peliculas/" + id, // Hacemos la petición PUT con el id de la película que queremos modificar
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cambios)
            }
        );
        if (respuesta.ok) {
            const pelicula = await respuesta.json();
            document.getElementById("mensaje").innerHTML =
                "Película modificada : " + pelicula.nombre + "(ID:" + pelicula.id + ")";
        } else {
            const error = await respuesta.text();
            document.getElementById("mensaje").innerHTML = error;
        }
    } catch (error) {
        document.getElementById("mensaje").innerHTML =
            "Error al conectar con la API";
        console.log(error);
    }

});

// DELETE Borrar una pelicula /peliculas/:nombre

document.getElementById("borrarPelicula").addEventListener("click", async function () {
    const nombre = document.getElementById("borrarPeliculaNombre").value; // nombre de la película que queremos borrar

    if (nombre === "") {
        document.getElementById("mensaje").innerHTML = "Introduce el nombre de la película que deseas borrar";
        return;
    }

    try {
        const respuesta = await fetch(
            API + "/peliculas/" + encodeURIComponent(nombre), // hacemos la peticion delete
            {
                method: "DELETE"
            }
        );
        const mensaje = await respuesta.text();
        document.getElementById("mensaje").innerHTML = mensaje; // Mostramos el mensaje de la API
    } catch (error) {
        document.getElementById("mensaje").innerHTML = "Error al conectar con la API";
        console.log(error);
    }
});

// POST Crear un actor /actores

document.getElementById("crearActor").addEventListener("click", async function () {
    const nombre = document.getElementById("actorNombre").value;
    const fecha = document.getElementById("actorFecha").value;
    const actor = { // Creamos un objeto actor con los datos del formulario
        nombre: nombre,
        fecha_nacimiento: fecha
    };

    try {
        const respuesta = await fetch(
            API + "/actores",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(actor)
            }
        );
        if (respuesta.ok) {
            const datos = await respuesta.json();
            document.getElementById("mensaje").innerHTML =
                "Actor creado : " + datos.nombre + " (ID: " + datos.id + ")";
        } else {
            const error = await respuesta.text();
            document.getElementById("mensaje").innerHTML = error;
        }
    } catch (error) {
        document.getElementById("mensaje").innerHTML =
            "Error al conectar con la API";
        console.log(error);
    }
});

// PUT Modificar un actor /actores/:id

document.getElementById("modificarActor").addEventListener("click", async function () {
    const id = document.getElementById("modificarActorId").value;
    const nombre = document.getElementById("modificarActorNombre").value;
    const fecha = document.getElementById("modificarActorFecha").value;
    const cambios = {};

    if (nombre !== "") {
        cambios.nombre = nombre;
    }

    if (fecha !== "") {
        cambios.fecha_nacimiento = fecha;
    }

    try {
        const respuesta = await fetch(
            API + "/actores/" + id,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cambios)
            }
        );
        if (respuesta.ok) {
            const actor = await respuesta.json();
            document.getElementById("mensaje").innerHTML =
                "Actor modificado : " + actor.nombre + " (ID: " + actor.id + ")";
        } else {
            const error = await respuesta.text();
            document.getElementById("mensaje").innerHTML = error;
        }
    } catch (error) {
        document.getElementById("mensaje").innerHTML =
            "Error al conectar con la API";
        console.log(error);
    }
});

// DELETE Borrar un actor /actores/:nombre

document.getElementById("borrarActor").addEventListener("click", async function () {
    const nombre = document.getElementById("borrarActorNombre").value;

    if (nombre === "") {
        document.getElementById("mensaje").innerHTML = "Introduce el nombre del actor que deseas borrar";
        return;
    }

    try {
        const respuesta = await fetch(
            API + "/actores/" + encodeURIComponent(nombre),
            {
                method: "DELETE"
            }
        );
        const mensaje = await respuesta.text();
        document.getElementById("mensaje").innerHTML = mensaje;
    } catch (error) {
        document.getElementById("mensaje").innerHTML = "Error al conectar con la API";
        console.log(error);
    }
});