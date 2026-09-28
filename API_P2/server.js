const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

// Leer y guardar listas en archivos JSON.
function leer(archivo) {
    const texto = fs.readFileSync(__dirname + "/" + archivo, "utf8");
    return JSON.parse(texto);
}

function guardar(archivo, lista) {
    fs.writeFileSync(__dirname + "/" + archivo, JSON.stringify(lista, null, 2));
}

// Buscar la posición de un elemento. -1 significa que no existe.
function buscar(lista, id) {
    for (let i = 0; i < lista.length; i++) {
        if (lista[i].id === id) {
            return i;
        }
    }
    return -1;
}

// Crear un ID que no esté utilizado en esta lista.
function nuevoId(lista) {
    let id = 1;
    for (let i = 0; i < lista.length; i++) {
        if (lista[i].id >= id) {
            id = lista[i].id + 1;
        }
    }
    return id;
}

function nombreYAnioValidos(nombre, anio) {
    return typeof nombre === "string" && nombre.trim() !== "" &&
           Number.isInteger(anio) && anio > 0;
}

function peliculaValida(datos) {
    if (!datos || !nombreYAnioValidos(datos.nombre, datos.anio)) {
        return false;
    }
    if (!Array.isArray(datos.actores)) {
        return false;
    }
    const actores = leer("actores.json");
    for (let i = 0; i < datos.actores.length; i++) {
        if (buscar(actores, datos.actores[i]) === -1) {
            return false;
        }
        if (datos.actores.indexOf(datos.actores[i]) !== i) {
            return false;
        }
    }
    return true;
}

function actorValido(datos) {
    if (!datos) {
        return false;
    }
    return nombreYAnioValidos(datos.nombreCompleto, datos.anioNacimiento);
}

app.get("/", function (req, res) {
    res.json({ mensaje: "API de películas y actores", rutas: ["/peliculas", "/actores"] });
});

// PELÍCULAS: GET, POST, DELETE y PUT.

// GET /peliculas o GET /peliculas?nombre=matrix
app.get("/peliculas", function (req, res) {
    const peliculas = leer("peliculas.json");
    let nombre = "";
    if (req.query.nombre !== undefined) {
        nombre = String(req.query.nombre).toLowerCase();
    }
    const resultados = [];
    for (let i = 0; i < peliculas.length; i++) {
        if (peliculas[i].nombre.toLowerCase().includes(nombre)) {
            resultados.push(peliculas[i]);
        }
    }
    res.json(resultados);
});

// GET /peliculas/1
app.get("/peliculas/:id", function (req, res) {
    const peliculas = leer("peliculas.json");
    const posicion = buscar(peliculas, Number(req.params.id));
    if (posicion === -1) {
        return res.status(404).json({ error: "Película no encontrada." });
    }
    res.json(peliculas[posicion]);
});

// POST /peliculas: crear una película.
app.post("/peliculas", function (req, res) {
    if (!peliculaValida(req.body)) {
        return res.status(400).json({ error: "Envía nombre, año entero positivo y actores como una lista de IDs existentes sin repetir." });
    }
    const peliculas = leer("peliculas.json");
    const pelicula = {
        id: nuevoId(peliculas),
        nombre: req.body.nombre.trim(),
        anio: req.body.anio,
        actores: req.body.actores
    };
    peliculas.push(pelicula);
    guardar("peliculas.json", peliculas);
    res.status(201).json(pelicula);
});

// DELETE /peliculas/1: borrar una película.
app.delete("/peliculas/:id", function (req, res) {
    const peliculas = leer("peliculas.json");
    const posicion = buscar(peliculas, Number(req.params.id));
    if (posicion === -1) {
        return res.status(404).json({ error: "Película no encontrada." });
    }
    peliculas.splice(posicion, 1);
    guardar("peliculas.json", peliculas);
    res.json({ mensaje: "Película borrada." });
});

// PUT /peliculas/1: enviar todos los campos editables.
// Para añadir o quitar actores, envía la lista completa de IDs que quieres conservar.
app.put("/peliculas/:id", function (req, res) {
    const peliculas = leer("peliculas.json");
    const posicion = buscar(peliculas, Number(req.params.id));
    if (posicion === -1) {
        return res.status(404).json({ error: "Película no encontrada." });
    }
    if (!peliculaValida(req.body)) {
        return res.status(400).json({ error: "Envía nombre, año entero positivo y actores como una lista de IDs existentes sin repetir." });
    }
    peliculas[posicion].nombre = req.body.nombre.trim();
    peliculas[posicion].anio = req.body.anio;
    peliculas[posicion].actores = req.body.actores;
    guardar("peliculas.json", peliculas);
    res.json(peliculas[posicion]);
});

// ACTORES: GET, POST, DELETE y PUT.

// GET /actores o GET /actores?nombre=ana
app.get("/actores", function (req, res) {
    const actores = leer("actores.json");
    let nombre = "";
    if (req.query.nombre !== undefined) {
        nombre = String(req.query.nombre).toLowerCase();
    }
    const resultados = [];
    for (let i = 0; i < actores.length; i++) {
        if (actores[i].nombreCompleto.toLowerCase().includes(nombre)) {
            resultados.push(actores[i]);
        }
    }
    res.json(resultados);
});

// GET /actores/1
app.get("/actores/:id", function (req, res) {
    const actores = leer("actores.json");
    const posicion = buscar(actores, Number(req.params.id));
    if (posicion === -1) {
        return res.status(404).json({ error: "Actor no encontrado." });
    }
    res.json(actores[posicion]);
});

// POST /actores: crear un actor.
app.post("/actores", function (req, res) {
    if (!actorValido(req.body)) {
        return res.status(400).json({ error: "Envía nombreCompleto y anioNacimiento como un entero positivo." });
    }
    const actores = leer("actores.json");
    const actor = {
        id: nuevoId(actores),
        nombreCompleto: req.body.nombreCompleto.trim(),
        anioNacimiento: req.body.anioNacimiento
    };
    actores.push(actor);
    guardar("actores.json", actores);
    res.status(201).json(actor);
});

// DELETE /actores/1: quitar antes sus asociaciones mediante PUT /peliculas/:id.
app.delete("/actores/:id", function (req, res) {
    const actores = leer("actores.json");
    const id = Number(req.params.id);
    const posicion = buscar(actores, id);
    if (posicion === -1) {
        return res.status(404).json({ error: "Actor no encontrado." });
    }
    const peliculas = leer("peliculas.json");
    for (let i = 0; i < peliculas.length; i++) {
        for (let j = 0; j < peliculas[i].actores.length; j++) {
            if (peliculas[i].actores[j] === id) {
                return res.status(409).json({ error: "Quita primero este actor de las películas en las que aparece." });
            }
        }
    }
    actores.splice(posicion, 1);
    guardar("actores.json", actores);
    res.json({ mensaje: "Actor borrado." });
});

// PUT /actores/1: enviar los dos campos editables.
app.put("/actores/:id", function (req, res) {
    const actores = leer("actores.json");
    const posicion = buscar(actores, Number(req.params.id));
    if (posicion === -1) {
        return res.status(404).json({ error: "Actor no encontrado." });
    }
    if (!actorValido(req.body)) {
        return res.status(400).json({ error: "Envía nombreCompleto y anioNacimiento como un entero positivo." });
    }
    actores[posicion].nombreCompleto = req.body.nombreCompleto.trim();
    actores[posicion].anioNacimiento = req.body.anioNacimiento;
    guardar("actores.json", actores);
    res.json(actores[posicion]);
});

// Respuesta para rutas que no existen.
app.use(function (req, res) {
    res.status(404).json({ error: "Ruta no encontrada." });
});

// Express envía aquí los errores de JSON y de lectura/escritura.
app.use(function (error, req, res, next) {
    console.error(error.message);
    if (error.status >= 400 && error.status < 500) {
        return res.status(error.status).json({ error: "La petición no es válida. Revisa el JSON y su tamaño." });
    }
    res.status(500).json({ error: "No se pudieron leer o guardar los datos del servidor." });
});

app.listen(3000, "127.0.0.1", function () {
    console.log("API disponible en http://127.0.0.1:3000");
});
