const daysInput = document.getElementById("days");
const clientCountInput = document.getElementById("clientCount");
const form = document.getElementById("energyForm");

const resultsDiv = document.getElementById("results");
const gananciaP = document.getElementById("ganancia");
const demandInputs = document.querySelectorAll("input");

daysInput.addEventListener("input", updateTable);
clientCountInput.addEventListener("input", updateTable);

form.addEventListener("submit", function (e) {
  e.preventDefault();
  generateDZN();
});

demandInputs.forEach((input) => {
  input.addEventListener("input", hideResults);
});

// Función para cambiar la clase y contenido del div de resultados
function showResults(result) {
  resultsDiv.classList.remove("no-results");
  resultsDiv.classList.add("results");
  gananciaP.textContent = result; // Establece el número de la función objetivo
}

// Función para volver a la clase de no-results
function hideResults() {
  resultsDiv.classList.remove("results");
  resultsDiv.classList.add("no-results");
  gananciaP.textContent = ""; // Borra el contenido del párrafo
}

function updateTable() {
  const days = parseInt(daysInput.value);
  const clientCount = parseInt(clientCountInput.value);
  generateClientTable(clientCount, days);
}

function generateClientTable(clientCount, days) {
  const table = document.getElementById("clientTable");
  table.innerHTML = ""; // Limpia la tabla

  // Crea el encabezado
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
                <th>Cliente</th>
                <th>Pago Independiente</th>
            `;
  for (let i = 1; i <= days; i++) {
    headerRow.innerHTML += `<th>Día ${i}</th>`;
  }
  table.appendChild(headerRow);

  // Crea filas para cada cliente
  for (let i = 1; i <= clientCount; i++) {
    const clientRow = document.createElement("tr");
    clientRow.innerHTML = `
                    <td>Cliente ${i}</td>
                    <td><input type="number" name="payment${i}" required></td>
                `;
    for (let j = 1; j <= days; j++) {
      clientRow.innerHTML += `<td><input type="number" name="demand${i}_${j}" class="demand-input" required></td>`;
    }
    table.appendChild(clientRow);
  }
}

function generateDZN() {
  const days = parseInt(daysInput.value);
  const clientCount = parseInt(clientCountInput.value);
  const data = {};

  // Recopila datos de costo de producción, capacidad, garantía mínima, etc.
  data.n = days;
  data.m = clientCount;
  data.cosN = parseFloat(document.getElementById("costN").value);
  data.cosH = parseFloat(document.getElementById("costH").value);
  data.cosT = parseFloat(document.getElementById("costT").value);
  data.capN = parseFloat(document.getElementById("capN").value);
  data.capH = parseFloat(document.getElementById("capH").value);
  data.capT = parseFloat(document.getElementById("capT").value);
  data.G = parseFloat(document.getElementById("garantia").value);

  data.P = [];
  for (let i = 1; i <= clientCount; i++) {
    data.P.push(parseFloat(document.getElementsByName(`payment${i}`)[0].value));
  }

  data.d = [];
  for (let i = 1; i <= clientCount; i++) {
    const clientDemands = [];
    for (let j = 1; j <= days; j++) {
      clientDemands.push(
        parseFloat(document.getElementsByName(`demand${i}_${j}`)[0].value)
      );
    }
    data.d.push(clientDemands);
  }

  // Convierte los datos en una cadena DZN
  let dznString = `% Datos generados desde el formulario\n`;
  for (const key in data) {
    if (Array.isArray(data[key])) {
      if (Array.isArray(data[key][0])) {
        // Es una matriz de matrices
        dznString += `${key} = [|${data[key]
          .map((row) => row.join(", "))
          .join("\n    |")}|];\n`;
      } else {
        // Es una matriz de valores
        dznString += `${key} = [${data[key].join(", ")}];\n`;
      }
    } else {
      dznString += `${key} = ${data[key]};\n`;
    }
  }

  // Descarga el archivo DZN
  // const blob = new Blob([dznString], { type: "text/plain" });
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement("a");
  // a.href = url;
  // a.download = "Datos.dzn";
  // a.click();
  // Ahora puedes enviar los datos al servidor para procesarlos
  fetch("/generate-dzn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.text())
    .then((result) => {
      // Resultado del modelo MiniZinc, puedes mostrarlo en tu HTML
      // const resultDiv = document.getElementById("results");
      // resultDiv.textContent = result;
      console.log(result);
      const regex = /Funcion Objetivo: (\d+)/;
      const match = result.match(regex);

      if (match) {
        // match[1] contiene el número encontrado
        const funcionObjetivo = parseInt(match[1], 10);
        console.log("Función Objetivo:", funcionObjetivo);
        showResults(funcionObjetivo);
      } else {
        console.log("No se encontró la función objetivo en la respuesta.");
      }
    })
    .catch((error) => {
      console.error("Error al generar DZN y ejecutar el modelo:", error);
    });
}
