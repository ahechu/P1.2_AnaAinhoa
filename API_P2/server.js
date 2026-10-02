const express = require("express");     // Importamos Express para crear el servidor
const fs = require("fs");               // Importamos fs para poder leer y modificar los archivos JSON
const path = require("path");           // Importamos path para indicar correctamente dónde están los archivos
const app = express();                  // Creamos la aplicación Express
const PORT = 3000;                      // Puerto donde funcionará la API

// CONFIGURACIÓN DEL SERVIDOR ====================================================================================================
app.use(express.json());                // Permite al servidor entender los JSON que recibe desde script.js mediante POST y PUT
app.use(express.static(__dirname));     // Permite servir index.html, script.js, estilo.css, etc. (__dirname representa la carpeta donde está server.js.)
const archivoPeliculas = path.join(__dirname, "peliculas.json");    // Indicamos dónde están nuestros archivos JSON
const archivoActores = path.join(__dirname, "actores.json");

// FUNCIONES PARA LEER Y GUARDAR LOS JSON ====================================================================================================
function leerDatos(archivo) {
    const contenido = fs.readFileSync(archivo, "utf-8");    // Leemos el archivo JSON como texto
    return JSON.parse(contenido);                           // Convertimos el texto JSON a un objeto Javascript
}

function guardarDatos(archivo, datos) {
    const contenido = JSON.stringify(datos, null, 2);       // Convertimos el objeto Javascript a JSON ((datos, null, 2) es como pretty print)
    fs.writeFileSync(archivo, contenido);                   // Guardamos el contenido en el archivo
}

// PELÍCULAS ======================================================================================================================================================

// BUSCAR UNA PELÍCULA POR NOMBRE ==================================================
// GET /peliculas?nombre=Titanic
app.get("/peliculas", function (req, res) {
    const datos = leerDatos(archivoPeliculas);      // Leemos peliculas.json
    const peliculas = datos.peliculas;              // Sacamos el array "peliculas"
    const nombre = req.query.nombre;                // Recogemos el nombre que viene en la URL (GET)

    if (!nombre) {                                  // Si no se ha enviado un nombre, mostramos un error
        return res.status(400).send(
            "Debes introducir el nombre de una película"
        );
    }

    const pelicula = peliculas.find(function (pelicula) {   // Buscamos una película cuyo nombre coincida
        return pelicula.nombre.toLowerCase() === nombre.toLowerCase();      // toLowerCase hace que no importen las mayúsculas
    });

    if (pelicula) {
        res.json(pelicula);                         // Si encontramos la película la enviamos en formato JSON
    } else {
        res.status(404).send("Película no encontrada");     // Si no existe, devolvemos error 404
    }
});

// CREAR UNA PELÍCULA ==================================================
// POST /peliculas
app.post("/peliculas", function (req, res) {
    const datos = leerDatos(archivoPeliculas);
    const peliculas = datos.peliculas;

    let nuevoId = 1;                                // Empezamos suponiendo que será la primera película
    if (peliculas.length > 0) {                     // Si ya existen películas
        let idMayor = peliculas[0].id;              // Guardamos el ID más grande que encontremos
        for (let i = 0; i < peliculas.length; i++) { // Recorremos todas las películas
            if (peliculas[i].id > idMayor) {
                idMayor = peliculas[i].id;          // Si encontramos un ID mayor lo guardamos
            }
        }
        nuevoId = idMayor + 1;                      // El nuevo ID será el siguiente al mayor
    }

    const nuevaPelicula = {                         // Creamos la nueva película
        id: nuevoId,                                // El ID lo genera el servidor automáticamente
        nombre: req.body.nombre,                    // Los demás datos vienen desde script.js
        ano: req.body.ano,
        actores: req.body.actores
    };

    peliculas.push(nuevaPelicula);                  // Añadimos la película al array
    guardarDatos(archivoPeliculas, datos);
    res.status(201).json(nuevaPelicula);            // Devolvemos la película creada; 201 = "Created"
});

// MODIFICAR UNA PELÍCULA ==================================================
// PUT /peliculas/1
app.put("/peliculas/:id", function (req, res) {
    const datos = leerDatos(archivoPeliculas);
    const peliculas = datos.peliculas;
    const id = Number(req.params.id);               // El ID de la URL llega como texto, hay que pasarlo a número

    const posicion = peliculas.findIndex(function (pelicula) {  // Buscamos la posición de la película
        return pelicula.id === id;
    });

    if (posicion === -1) {                          // findIndex devuelve -1 si no encuentra la película
        return res.status(404).send(
            "Película no encontrada"
        );
    }

    if (req.body.nombre !== undefined) {            // Solo modificamos el nombre
        peliculas[posicion].nombre = req.body.nombre;
    }
    if (req.body.ano !== undefined) {               // Solo modificamos el año
        peliculas[posicion].ano = req.body.ano;
    }
    if (req.body.actores !== undefined) {           // Solo modificamos los actores
        peliculas[posicion].actores = req.body.actores;
    }

    guardarDatos(archivoPeliculas, datos);
    res.json(peliculas[posicion]);                  // Devolvemos la película modificada
});

// BORRAR UNA PELÍCULA ==================================================
// DELETE /peliculas/1
app.delete("/peliculas/:nombre", function (req, res) {
    const datos = leerDatos(archivoPeliculas);
    const peliculas = datos.peliculas;
    const nombre = req.params.nombre;                 // Recogemos el nombre de la película que queremos borrar

    const posicion = peliculas.findIndex(function (pelicula) {
        return pelicula.nombre.toLowerCase() === nombre.toLowerCase();
    });
    if (posicion === -1) {
        return res.status(404).send(
            "Película no encontrada"
        );
    }

    peliculas.splice(posicion, 1);                  // splice elimina un elemento del array empezando en "posicion"

    guardarDatos(archivoPeliculas, datos);
    res.send("Película borrada correctamente");     // Devolvemos un mensaje de que se ha borrado
});

// ACTORES ======================================================================================================================================================
// CREAR UN ACTOR ==================================================
// POST /actores
app.post("/actores", function (req, res) {
    const datos = leerDatos(archivoActores);
    const actores = datos.actores;

    let nuevoId = 1;
    if (actores.length > 0) {
        let idMayor = actores[0].id;                // Guardamos el ID más grande que encontremos
        for (let i = 0; i < actores.length; i++) {
            if (actores[i].id > idMayor) {
                idMayor = actores[i].id;
            }
        }
        nuevoId = idMayor + 1;
    }

    const nuevoActor = {                            // Creamos el nuevo actor
        id: nuevoId,
        nombre: req.body.nombre,
        fecha_nacimiento: req.body.fecha_nacimiento
    };

    actores.push(nuevoActor);
    guardarDatos(archivoActores, datos);
    res.status(201).json(nuevoActor);               // Devolvemos el actor creado
});

// MODIFICAR UN ACTOR ==================================================
// PUT /actores/1
app.put("/actores/:id", function (req, res) {
    const datos = leerDatos(archivoActores);
    const actores = datos.actores;
    const id = Number(req.params.id);

    const posicion = actores.findIndex(function (actor) {
        return actor.id === id;
    });

    if (posicion === -1) {
        return res.status(404).send(
            "Actor no encontrado"
        );
    }

    if (req.body.nombre !== undefined) {
        actores[posicion].nombre = req.body.nombre;
    }
    if (req.body.fecha_nacimiento !== undefined) {
        actores[posicion].fecha_nacimiento =
            req.body.fecha_nacimiento;
    }

    guardarDatos(archivoActores, datos);
    res.json(actores[posicion]);                    // Devolvemos el actor modificado

});

// BORRAR UN ACTOR ==================================================
// DELETE /actores/1
app.delete("/actores/:nombre", function (req, res) {
    const datos = leerDatos(archivoActores);
    const actores = datos.actores;
    const nombre = req.params.nombre;

    const posicion = actores.findIndex(function (actor) {
        return actor.nombre.toLowerCase() === nombre.toLowerCase();
    });

    if (posicion === -1) {
        return res.status(404).send(
            "Actor no encontrado"
        );
    }

    actores.splice(posicion, 1);                    // Eliminamos el actor
    guardarDatos(archivoActores, datos);
    res.send("Actor borrado correctamente");        // Devolvemos mensaje de borrado
});

// ==================================================
// INICIAR EL SERVIDOR
// ==================================================
app.listen(PORT, function () {
    console.log(
        "Servidor funcionando en http://localhost:" + PORT
    );
});