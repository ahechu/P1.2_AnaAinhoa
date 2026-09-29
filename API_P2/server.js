// Importamos Express para crear el servidor
const express = require("express");

// Importamos fs para poder leer y modificar los archivos JSON
const fs = require("fs");

// Importamos path para indicar correctamente dónde están los archivos
const path = require("path");


// Creamos la aplicación Express
const app = express();


// Puerto donde funcionará la API
const PORT = 3000;


// ==================================================
// CONFIGURACIÓN DEL SERVIDOR
// ==================================================

// Permite al servidor entender los JSON que recibe
// desde script.js mediante POST y PUT
app.use(express.json());


// Permite servir index.html, script.js, estilo.css, etc.
app.use(express.static(__dirname));


// Indicamos dónde están nuestros archivos JSON
const archivoPeliculas = path.join(__dirname, "peliculas.json");
const archivoActores = path.join(__dirname, "actores.json");



// ==================================================
// FUNCIONES PARA LEER Y GUARDAR LOS JSON
// ==================================================


// Lee un archivo JSON
function leerDatos(archivo) {

    // Leemos el archivo como texto
    const contenido = fs.readFileSync(archivo, "utf-8");

    // Convertimos el texto JSON a un objeto Javascript
    return JSON.parse(contenido);
}


// Guarda datos dentro de un archivo JSON
function guardarDatos(archivo, datos) {

    // Convertimos el objeto Javascript a JSON
    // null, 2 sirve para que el JSON quede bien ordenado
    const contenido = JSON.stringify(datos, null, 2);

    // Guardamos el contenido en el archivo
    fs.writeFileSync(archivo, contenido);
}



// ==================================================
// PELÍCULAS
// ==================================================



// ==================================================
// BUSCAR UNA PELÍCULA POR NOMBRE
//
// GET /peliculas?nombre=Titanic
// ==================================================

app.get("/peliculas", function (req, res) {

    // Leemos peliculas.json
    const datos = leerDatos(archivoPeliculas);

    // Sacamos el array "peliculas"
    const peliculas = datos.peliculas;


    // Recogemos el nombre que viene en la URL
    // Ejemplo:
    // /peliculas?nombre=Titanic
    const nombre = req.query.nombre;


    // Si no se ha enviado un nombre, mostramos un error
    // De esta forma GET /peliculas NO devuelve todas las películas
    if (!nombre) {

        return res.status(400).send(
            "Debes introducir el nombre de una película"
        );
    }


    // Buscamos una película cuyo nombre coincida
    const pelicula = peliculas.find(function (pelicula) {

        // toLowerCase hace que no importen las mayúsculas
        return pelicula.nombre.toLowerCase() === nombre.toLowerCase();

    });


    // Si encontramos la película
    if (pelicula) {

        // La enviamos en formato JSON
        res.json(pelicula);

    } else {

        // Si no existe, devolvemos error 404
        res.status(404).send("Película no encontrada");
    }

});



// ==================================================
// CREAR UNA PELÍCULA
//
// POST /peliculas
// ==================================================

app.post("/peliculas", function (req, res) {

    // Leemos peliculas.json
    const datos = leerDatos(archivoPeliculas);

    // Sacamos el array de películas
    const peliculas = datos.peliculas;


    // Empezamos suponiendo que será la primera película
    let nuevoId = 1;


    // Si ya existen películas
    if (peliculas.length > 0) {

        // Inicialmente consideramos que el primer ID
        // es el ID más grande
        let idMayor = peliculas[0].id;


        // Recorremos todas las películas
        for (let i = 0; i < peliculas.length; i++) {

            // Si encontramos un ID mayor
            if (peliculas[i].id > idMayor) {

                // Lo guardamos
                idMayor = peliculas[i].id;
            }
        }


        // El nuevo ID será el siguiente al mayor
        nuevoId = idMayor + 1;
    }


    // Creamos la nueva película
    const nuevaPelicula = {

        // El ID lo genera el servidor automáticamente
        id: nuevoId,

        // Los demás datos vienen desde script.js
        nombre: req.body.nombre,

        ano: req.body.ano,

        actores: req.body.actores
    };


    // Añadimos la película al array
    peliculas.push(nuevaPelicula);


    // Guardamos todo de nuevo en peliculas.json
    guardarDatos(archivoPeliculas, datos);


    // Devolvemos la película creada
    // 201 significa "Created"
    res.status(201).json(nuevaPelicula);

});



// ==================================================
// MODIFICAR UNA PELÍCULA
//
// PUT /peliculas/1
// ==================================================

app.put("/peliculas/:id", function (req, res) {

    // Leemos peliculas.json
    const datos = leerDatos(archivoPeliculas);

    const peliculas = datos.peliculas;


    // El ID escrito en la URL llega como texto,
    // así que lo convertimos a número
    const id = Number(req.params.id);


    // Buscamos la posición de la película
    const posicion = peliculas.findIndex(function (pelicula) {

        return pelicula.id === id;

    });


    // findIndex devuelve -1 si no encuentra la película
    if (posicion === -1) {

        return res.status(404).send(
            "Película no encontrada"
        );
    }


    // Solo modificamos el nombre si se ha enviado
    if (req.body.nombre !== undefined) {

        peliculas[posicion].nombre = req.body.nombre;
    }


    // Solo modificamos el año si se ha enviado
    if (req.body.ano !== undefined) {

        peliculas[posicion].ano = req.body.ano;
    }


    // Solo modificamos los actores si se han enviado
    if (req.body.actores !== undefined) {

        peliculas[posicion].actores = req.body.actores;
    }


    // Guardamos los cambios
    guardarDatos(archivoPeliculas, datos);


    // Devolvemos la película modificada
    res.json(peliculas[posicion]);

});



// ==================================================
// BORRAR UNA PELÍCULA
//
// DELETE /peliculas/1
// ==================================================

app.delete("/peliculas/:id", function (req, res) {

    // Leemos peliculas.json
    const datos = leerDatos(archivoPeliculas);

    const peliculas = datos.peliculas;


    // Convertimos el ID de la URL a número
    const id = Number(req.params.id);


    // Buscamos la posición de la película
    const posicion = peliculas.findIndex(function (pelicula) {

        return pelicula.id === id;

    });


    // Si no existe
    if (posicion === -1) {

        return res.status(404).send(
            "Película no encontrada"
        );
    }


    // splice elimina un elemento del array
    // empezando en "posicion"
    peliculas.splice(posicion, 1);


    // Guardamos los cambios
    guardarDatos(archivoPeliculas, datos);


    // Devolvemos un mensaje
    res.send("Película borrada correctamente");

});



// ==================================================
// ACTORES
// ==================================================



// ==================================================
// CREAR UN ACTOR
//
// POST /actores
// ==================================================

app.post("/actores", function (req, res) {

    // Leemos actores.json
    const datos = leerDatos(archivoActores);

    const actores = datos.actores;


    // Generamos automáticamente el ID
    let nuevoId = 1;


    if (actores.length > 0) {

        let idMayor = actores[0].id;


        for (let i = 0; i < actores.length; i++) {

            if (actores[i].id > idMayor) {

                idMayor = actores[i].id;
            }
        }


        nuevoId = idMayor + 1;
    }


    // Creamos el nuevo actor
    const nuevoActor = {

        id: nuevoId,

        nombre: req.body.nombre,

        fecha_nacimiento: req.body.fecha_nacimiento

    };


    // Añadimos el actor
    actores.push(nuevoActor);


    // Guardamos actores.json
    guardarDatos(archivoActores, datos);


    // Devolvemos el actor creado
    res.status(201).json(nuevoActor);

});



// ==================================================
// MODIFICAR UN ACTOR
//
// PUT /actores/1
// ==================================================

app.put("/actores/:id", function (req, res) {

    // Leemos actores.json
    const datos = leerDatos(archivoActores);

    const actores = datos.actores;


    // Cogemos el ID indicado en la URL
    const id = Number(req.params.id);


    // Buscamos al actor
    const posicion = actores.findIndex(function (actor) {

        return actor.id === id;

    });


    // Si no existe
    if (posicion === -1) {

        return res.status(404).send(
            "Actor no encontrado"
        );
    }


    // Cambiamos el nombre solamente si se ha enviado
    if (req.body.nombre !== undefined) {

        actores[posicion].nombre = req.body.nombre;
    }


    // Cambiamos la fecha solamente si se ha enviado
    if (req.body.fecha_nacimiento !== undefined) {

        actores[posicion].fecha_nacimiento =
            req.body.fecha_nacimiento;
    }


    // Guardamos los cambios
    guardarDatos(archivoActores, datos);


    // Devolvemos el actor modificado
    res.json(actores[posicion]);

});



// ==================================================
// BORRAR UN ACTOR
//
// DELETE /actores/1
// ==================================================

app.delete("/actores/:id", function (req, res) {

    // Leemos actores.json
    const datos = leerDatos(archivoActores);

    const actores = datos.actores;


    // Convertimos el ID a número
    const id = Number(req.params.id);


    // Buscamos al actor
    const posicion = actores.findIndex(function (actor) {

        return actor.id === id;

    });


    // Si no existe
    if (posicion === -1) {

        return res.status(404).send(
            "Actor no encontrado"
        );
    }


    // Eliminamos el actor
    actores.splice(posicion, 1);


    // Guardamos el archivo
    guardarDatos(archivoActores, datos);


    // Respondemos al navegador
    res.send("Actor borrado correctamente");

});



// ==================================================
// INICIAR EL SERVIDOR
// ==================================================

app.listen(PORT, function () {

    console.log(
        "Servidor funcionando en http://localhost:" + PORT
    );

});