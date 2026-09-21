const API_KEY = "30f8c06e";

const entrada = document.getElementById("titulo");
const boton = document.getElementById("buscar");
const resultado = document.getElementById("resultado");

boton.addEventListener("click", async () => {
    const titulo = entrada.value.trim();

    if (titulo === "") {
        resultado.textContent = "Introduce el título de una película.";
        return;
    }

    try {
    const respuesta = await fetch(
        "https://www.omdbapi.com/?" + "apikey=" + API_KEY + "&t=" + titulo + "&type=movie"
    );

    if (!respuesta.ok) {
        throw new Error("Error HTTP: " + respuesta.status);
    }

    const datos = await respuesta.json();

    if (datos.Response === "False") {
        resultado.textContent = datos.Error;
        return;
    }

    resultado.textContent =
        "Película: " + datos.Title +
        " | Director: " + datos.Director +
        " | Año: " + datos.Year;
    }

    catch (error) {
    resultado.textContent = error.message;
    }
});