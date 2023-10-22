const express = require("express");
const path = require("path");
const app = express();
const port = 3001;
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

app.use(express.static("public"));
app.use(express.json()); // Permite el análisis de solicitudes JSON

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

app.post("/generate-dzn", async (req, res) => {
  try {
    const data = req.body;

    // Genera el archivo DZN con los datos recibidos
    const dznContent = generateDZNContent(data);
    fs.writeFileSync("Datos.dzn", dznContent);

    // Determina y ejecuta el archivo de modelo MiniZinc a utilizar
    let modelFile = "PlantaEnergia.mzn";
    if ("ns" in data && "ps" in data) {
      modelFile = "PlantaEnergia_Restricción.mzn";
    }
    const { stdout } = await exec(`minizinc --solver COIN-BC ${modelFile} Datos.dzn`);

    // Envía la respuesta al cliente
    res.send(stdout);
  } catch (error) {
    console.error("Error al generar DZN y ejecutar el modelo:", error);
    res.status(500).send("Error al procesar los datos y ejecutar el modelo.");
  }
});

app.listen(port, () => {
  console.log(`Servidor Node.js en funcionamiento en http://localhost:${port}`);
});

function generateDZNContent(data) {
  // Genera el contenido del archivo DZN a partir de los datos recibidos
  let dznString = `% Datos generados desde el formulario\n`;
  for (const key in data) {
    if (Array.isArray(data[key])) {
      if (Array.isArray(data[key][0])) {
        dznString += `${key} = [|${data[key]
          .map((row) => row.join(", "))
          .join("\n    |")}|];\n`;
      } else {
        dznString += `${key} = [${data[key].join(", ")}];\n`;
      }
    } else {
      dznString += `${key} = ${data[key]};\n`;
    }
  }
  return dznString;
}
