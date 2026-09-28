// Dirección donde está funcionando nuestra API
const API = "http://localhost:3000";


// ==================================================
// BUSCAR UNA PELÍCULA POR NOMBRE
// GET /peliculas?nombre=Titanic
// ==================================================

document.getElementById("buscarPelicula").addEventListener("click", async function () {

    // Cogemos el nombre escrito en el input
    const nombre = document.getElementById("buscarNombre").value;

    // Lugar donde vamos a mostrar el resultado
    const resultado = document.getElementById("resultado");


    // Comprobamos que el usuario haya escrito algo
    if (nombre === "") {
        resultado.innerHTML = "Escribe el nombre de una película";
        return;
    }


    try {

        // Hacemos la petición GET a nuestra API
        const respuesta = await fetch(
            API + "/peliculas?nombre=" + encodeURIComponent(nombre)
        );


        // Si la respuesta es correcta
        if (respuesta.ok) {

            // Convertimos la respuesta JSON a Javascript
            const pelicula = await respuesta.json();


            // Mostramos los datos de la película
            resultado.innerHTML =
                "<h3>" + pelicula.nombre + "</h3>" +
                "<p>ID: " + pelicula.id + "</p>" +
                "<p>Año: " + pelicula.anoPublicacion + "</p>" +
                "<p>Actores: " + pelicula.actores.join(", ") + "</p>";

        } else {

            // Si la película no existe, la API nos devuelve un texto
            const error = await respuesta.text();

            resultado.innerHTML = error;
        }

    } catch (error) {

        resultado.innerHTML = "Error al conectar con la API";

        console.log(error);
    }

});



// ==================================================
// CREAR UNA PELÍCULA
// POST /peliculas
// ==================================================

document.getElementById("crearPelicula").addEventListener("click", async function () {

    // Cogemos los valores escritos en los inputs
    const id = document.getElementById("peliculaId").value;
    const nombre = document.getElementById("peliculaNombre").value;
    const ano = document.getElementById("peliculaAno").value;

    // Los actores se escriben así:
    // 1,2,3
    const textoActores = document.getElementById("peliculaActores").value;


    // Creamos inicialmente un array vacío
    let actores = [];


    // Si se han escrito actores, los separamos por las comas
    if (textoActores !== "") {

        actores = textoActores.split(",");

        // Convertimos cada ID de texto a número
        actores = actores.map(function (actor) {
            return Number(actor.trim());
        });
    }


    // Creamos el objeto que enviaremos a la API
    const pelicula = {
        id: Number(id),
        nombre: nombre,
        anoPublicacion: Number(ano),
        actores: actores
    };


    try {

        // Hacemos la petición POST
        const respuesta = await fetch(API + "/peliculas", {

            method: "POST",

            // Indicamos que enviamos JSON
            headers: {
                "Content-Type": "application/json"
            },

            // Convertimos nuestro objeto Javascript a JSON
            body: JSON.stringify(pelicula)
        });


        if (respuesta.ok) {

            const datos = await respuesta.json();

            document.getElementById("mensaje").innerHTML =
                "Película creada correctamente: " + datos.nombre;

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



// ==================================================
// MODIFICAR UNA PELÍCULA
// PUT /peliculas/:id
// ==================================================

document.getElementById("modificarPelicula").addEventListener("click", async function () {

    // ID de la película que queremos modificar
    const id = document.getElementById("modificarPeliculaId").value;


    // Nuevos valores
    const nombre = document.getElementById("modificarPeliculaNombre").value;
    const ano = document.getElementById("modificarPeliculaAno").value;
    const textoActores = document.getElementById("modificarPeliculaActores").value;


    // Creamos un objeto vacío
    const cambios = {};


    // Solamente añadimos al objeto los campos
    // que el usuario haya rellenado

    if (nombre !== "") {
        cambios.nombre = nombre;
    }


    if (ano !== "") {
        cambios.anoPublicacion = Number(ano);
    }


    if (textoActores !== "") {

        let actores = textoActores.split(",");

        actores = actores.map(function (actor) {
            return Number(actor.trim());
        });

        cambios.actores = actores;
    }


    try {

        // Enviamos el PUT indicando el ID en la URL
        const respuesta = await fetch(
            API + "/peliculas/" + id,
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
                "Película modificada correctamente: " + pelicula.nombre;

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



// ==================================================
// BORRAR UNA PELÍCULA
// DELETE /peliculas/:id
// ==================================================

document.getElementById("borrarPelicula").addEventListener("click", async function () {

    // Cogemos el ID de la película que queremos borrar
    const id = document.getElementById("borrarPeliculaId").value;


    if (id === "") {

        document.getElementById("mensaje").innerHTML =
            "Introduce el ID de la película";

        return;
    }


    try {

        // Petición DELETE
        const respuesta = await fetch(
            API + "/peliculas/" + id,
            {
                method: "DELETE"
            }
        );


        // DELETE devuelve un texto
        const mensaje = await respuesta.text();


        // Mostramos el mensaje que devuelve la API
        document.getElementById("mensaje").innerHTML = mensaje;

    } catch (error) {

        document.getElementById("mensaje").innerHTML =
            "Error al conectar con la API";

        console.log(error);
    }

});



// ==================================================
// CREAR UN ACTOR
// POST /actores
// ==================================================

document.getElementById("crearActor").addEventListener("click", async function () {

    // Recogemos los datos escritos
    const id = document.getElementById("actorId").value;
    const nombre = document.getElementById("actorNombre").value;
    const ano = document.getElementById("actorAno").value;


    // Creamos el objeto actor
    const actor = {
        id: Number(id),
        nombreCompleto: nombre,
        anoNacimiento: Number(ano)
    };


    try {

        // Enviamos el actor mediante POST
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
                "Actor creado correctamente: " + datos.nombreCompleto;

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



// ==================================================
// MODIFICAR UN ACTOR
// PUT /actores/:id
// ==================================================

document.getElementById("modificarActor").addEventListener("click", async function () {

    // ID del actor que queremos modificar
    const id = document.getElementById("modificarActorId").value;


    // Nuevos datos
    const nombre = document.getElementById("modificarActorNombre").value;
    const ano = document.getElementById("modificarActorAno").value;


    // Objeto donde guardaremos los cambios
    const cambios = {};


    // Solamente enviamos los campos que estén escritos

    if (nombre !== "") {
        cambios.nombreCompleto = nombre;
    }


    if (ano !== "") {
        cambios.anoNacimiento = Number(ano);
    }


    try {

        // Enviamos la modificación mediante PUT
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
                "Actor modificado correctamente: " + actor.nombreCompleto;

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



// ==================================================
// BORRAR UN ACTOR
// DELETE /actores/:id
// ==================================================

document.getElementById("borrarActor").addEventListener("click", async function () {

    // Cogemos el ID del actor
    const id = document.getElementById("borrarActorId").value;


    if (id === "") {

        document.getElementById("mensaje").innerHTML =
            "Introduce el ID del actor";

        return;
    }


    try {

        // Hacemos la petición DELETE
        const respuesta = await fetch(
            API + "/actores/" + id,
            {
                method: "DELETE"
            }
        );


        // La API devuelve un mensaje de texto
        const mensaje = await respuesta.text();


        document.getElementById("mensaje").innerHTML = mensaje;

    } catch (error) {

        document.getElementById("mensaje").innerHTML =
            "Error al conectar con la API";

        console.log(error);
    }

});