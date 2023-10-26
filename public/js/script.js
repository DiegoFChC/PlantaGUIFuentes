const daysInput = document.getElementById("days");
const clientCountInput = document.getElementById("clientCount");
const form = document.getElementById("energyForm");

const resultsDiv = document.getElementById("results");
const gananciaP = document.getElementById("ganancia");
const demandInputs = document.querySelectorAll("input");
const consecutiveDaysInput = document.getElementById("consecutiveDays");
const errorMessage = document.getElementById("error-message");

const habilitarCamposButton = document.getElementById("habilitarCampos");

habilitarCamposButton.addEventListener("click", habilitarCampos);

daysInput.addEventListener("input", updateTable);
clientCountInput.addEventListener("input", updateTable);

form.addEventListener("submit", function (e) {
  e.preventDefault();
  generateDZN();
  const texto =
    "Produccion Entregada a Cliente: \n[150, 300, 200, 300, 200, 500, 500, 200, 300, 200, 300, 700, 700, 300, 300, 300, 400, 100, 150, 200, 450, 500, 300, 200, 300, 200, 450, 500, 200, 300]\nDemanda: \n[300, 300, 200, 300, 200, 500, 500, 200, 300, 200, 300, 700, 700, 300, 300, 300, 400, 100, 300, 200, 450, 500, 300, 200, 300, 200, 450, 500, 200, 300]\nProduccion Central Nuclear: \n[1000, 400, 900, 1000, 600, 1000]\nProduccion Central Hidroeléctrica: \n[300, 300, 300, 300, 300, 300]\nProduccion Central Térmica: \n[500, 500, 500, 500, 500, 500]\nFuncion Objetivo: \n25300000";

  // console.log("datos", extraerDatos(texto));
});

demandInputs.forEach((input) => {
  input.addEventListener("input", hideResults);
});

consecutiveDaysInput.addEventListener("input", function () {
  const consecutiveDays = parseInt(consecutiveDaysInput.value);
  const totalDays = parseInt(daysInput.value);

  if (consecutiveDays > totalDays) {
    errorMessage.textContent =
      "Error: La cantidad de días consecutivos no puede ser mayor que la cantidad total de días ingresados en el campo superior.";
    consecutiveDaysInput.classList.add("error");
  } else {
    errorMessage.textContent = ""; // Borra el mensaje de error
    consecutiveDaysInput.classList.remove("error");
  }
});

const reloadButton = document.getElementById("reloadButton");

reloadButton.addEventListener("click", function () {
  location.reload(); // Recarga la página actual
});

// Función para cambiar la clase y contenido del div de resultados
function showResults(result) {
  let data = "Su ganancia neta dadas estas condiciones es de $ " + result;
  console.log(data);
  resultsDiv.classList.remove("no-results");
  resultsDiv.classList.add("results");
  gananciaP.textContent = data; // Establece el número de la función objetivo
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

function habilitarCampos() {
  const camposAdicionales = document.getElementById("camposAdicionales");
  const botonHabilitar = document.getElementById("habilitarCampos");

  camposAdicionales.style.display = "block";
  document.getElementById("consecutiveDays").focus();
  botonHabilitar.style.display = "none";
}

function generateDZN() {
  const days = parseInt(daysInput.value);
  const clientCount = parseInt(clientCountInput.value);
  const data = {};
  const camposAdicionales = document.getElementById("camposAdicionales");

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
  if (camposAdicionales.style.display != "none") {
    data.ns = parseInt(document.getElementById("consecutiveDays").value);
    data.ps = parseFloat(document.getElementById("minGuarantee").value);
  }

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

  fetch("/generate-dzn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      const data = extraerDatos(result);
      console.log(data);
      const dataObject = transformarObjeto(data);
      console.log(dataObject);
      generarResultadosTabla1(dataObject);
      generarResultadosTabla2(dataObject);
      generarResultadosTabla3(dataObject);

      const gananciaP = document.getElementById("ganancia");
      const resultsDiv = document.getElementById("results");
      gananciaP.textContent = `$ ${dataObject.funcionObjetivo}`;
      resultsDiv.classList.remove("no-results");
      resultsDiv.classList.add("results");
    })
    .catch((error) => {
      console.error("Error al generar DZN y ejecutar el modelo:", error);
    });
}

function extraerDatos(texto) {
  const regex = /\[[^\]]+\]/g;
  const coincidencias = texto.match(regex);
  if (coincidencias && coincidencias.length >= 6) {
    const datos = coincidencias.slice(0, 6).map((dato) => JSON.parse(dato));

    // Buscar el valor de la Funcion Objetivo
    const funcionObjetivoRegex = /Funcion\s+Objetivo:\s*(\d+)/;
    const matchFuncionObjetivo = texto.match(funcionObjetivoRegex);
    if (matchFuncionObjetivo && matchFuncionObjetivo[1]) {
      datos.push(parseInt(matchFuncionObjetivo[1], 10));
    } else {
      datos.push(null);
    }

    return {
      produccionEntregadaAClientes: datos[0],
      demandaClientes: datos[1],
      produccionCentralNuclear: datos[2],
      produccionCentralHidroelectrica: datos[3],
      produccionCentralTermica: datos[4],
      ganaciasPorClienteCadaDia: datos[5],
      funcionObjetivo: datos[6],
    };
  } else {
    return null;
  }
}

function transformarObjeto(objeto) {
  const m =
    objeto.produccionEntregadaAClientes.length /
    objeto.produccionCentralHidroelectrica.length;
  const n = objeto.produccionCentralHidroelectrica.length;

  const entregaAClientes = {};
  const demandaDeClientes = {};
  const gananciaPorClienteDia = {};

  for (let i = 0; i < m; i++) {
    const clienteEntrega = objeto.produccionEntregadaAClientes.slice(
      i * n,
      (i + 1) * n
    );
    entregaAClientes[`cliente${i + 1}`] = clienteEntrega;

    const clienteDemanda = objeto.demandaClientes.slice(i * n, (i + 1) * n);
    demandaDeClientes[`cliente${i + 1}`] = clienteDemanda;

    const clienteGanancia = objeto.ganaciasPorClienteCadaDia.slice(
      i * n,
      (i + 1) * n
    );
    gananciaPorClienteDia[`cliente${i + 1}`] = clienteGanancia;
  }

  const centralNuclear = {};
  const centralHidroelectrica = {};
  const centralTermica = {};

  for (let i = 0; i < n; i++) {
    centralNuclear[`entregaDia${i + 1}`] = objeto.produccionCentralNuclear[i];
    centralHidroelectrica[`entregaDia${i + 1}`] =
      objeto.produccionCentralHidroelectrica[i];
    centralTermica[`entregaDia${i + 1}`] = objeto.produccionCentralTermica[i];
  }

  const funcionObjetivo = objeto.funcionObjetivo;

  const resultado = {
    entregaAClientes: entregaAClientes,
    demandaDeClientes: demandaDeClientes,
    centralNuclear: centralNuclear,
    centralHidroelectrica: centralHidroelectrica,
    centralTermica: centralTermica,
    gananciaClientesPorDia: gananciaPorClienteDia,
    funcionObjetivo: funcionObjetivo,
  };

  return resultado;
}

function generarResultadosTabla1(dataObject) {
  const clientDemandTable = document.getElementById("clientDemandTable");
  const days = Object.keys(dataObject.centralHidroelectrica).length;
  const clientCount = Object.keys(dataObject.entregaAClientes).length;
  console.log(clientCount, days);

  //TABLA 1
  // Limpia la tabla si ya contiene datos anteriores
  clientDemandTable.innerHTML = "";

  // Crea el encabezado de la tabla
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Cliente</th>";
  for (let j = 0; j < days; j++) {
    headerRow.innerHTML += `<th>Demanda del día ${j + 1}</th>`;
    headerRow.innerHTML += `<th>Valor entregado en el día ${j + 1}</th>`; // Nueva columna
  }
  clientDemandTable.appendChild(headerRow);

  // Llena la tabla con los nombres de los clientes y los valores de demanda y demanda entregada
  for (let i = 0; i < clientCount; i++) {
    const clientRow = document.createElement("tr");
    clientRow.innerHTML = `<td>Cliente ${i + 1}</td>`;
    for (let j = 0; j < days; j++) {
      const demandaCliente = dataObject.demandaDeClientes[`cliente${i + 1}`][j]; // Valor de demanda
      const demandaEntregada =
        dataObject.entregaAClientes[`cliente${i + 1}`][j]; // Valor de demanda entregada
      clientRow.innerHTML += `<td>${demandaCliente}</td>`; // Columna para el día con demanda
      clientRow.innerHTML += `<td>${demandaEntregada}</td>`; // Columna para la demanda entregada en el día
    }
    clientDemandTable.appendChild(clientRow);
  }
}

function generarResultadosTabla2(dataObject) {
  const powerPlantTable = document.getElementById("powerPlantTable");
  const centralNames = [
    "Central hidroeléctrica",
    "Central térmica",
    "Central nuclear",
  ];
  const centralNamesObject = [
    "centralHidroelectrica",
    "centralTermica",
    "centralNuclear",
  ];
  powerPlantTable.innerHTML = "";

  // Obtén la cantidad de días desde los resultados
  const days = Object.keys(dataObject.centralHidroelectrica).length;
  // Crea el encabezado de la tabla
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Centrales</th>";
  for (let j = 0; j < days; j++) {
    headerRow.innerHTML += `<th>Energía entregada en día ${j + 1}</th>`;
  }
  powerPlantTable.appendChild(headerRow);

  // Llena la tabla con los nombres de las centrales y los datos correspondientes
  for (const centralName of centralNamesObject) {
    const centralRow = document.createElement("tr");
    centralRow.innerHTML = `<td>${centralName}</td>`;

    // Obtén los datos correspondientes a la central
    const centralData = dataObject[centralName];

    for (let j = 0; j < days; j++) {
      if (
        typeof centralData === "object" &&
        centralData[`entregaDia${j + 1}`]
      ) {
        // Accede a los valores en el objeto
        const cell = document.createElement("td");
        cell.textContent = centralData[`entregaDia${j + 1}`];
        centralRow.appendChild(cell);
      } else {
        // Si no hay datos, coloca una celda vacía
        centralRow.innerHTML += `<td>${0}</td>`;
      }
    }

    powerPlantTable.appendChild(centralRow);
  }
}

function generarResultadosTabla3(dataObject) {
  const gananciaClientes = document.getElementById(
    "gananciaPorClienteTabla"
  );
  const days = Object.keys(dataObject.centralHidroelectrica).length;
  const clientCount = Object.keys(dataObject.entregaAClientes).length;
  console.log(clientCount, days);

  //TABLA 1
  // Limpia la tabla si ya contiene datos anteriores
  gananciaClientes.innerHTML = "";

  // Crea el encabezado de la tabla
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Cliente</th>";
  for (let j = 0; j < days; j++) {
    headerRow.innerHTML += `<th>Ganancia del dia ${j + 1}</th>`;
  }
  gananciaClientes.appendChild(headerRow);

  // Llena la tabla con los nombres de los clientes y los valores de la ganancia
  for (let i = 0; i < clientCount; i++) {
    const clientRow = document.createElement("tr");
    clientRow.innerHTML = `<td>Cliente ${i + 1}</td>`;
    for (let j = 0; j < days; j++) {
      const gananciaCliente = dataObject.gananciaClientesPorDia[`cliente${i + 1}`][j];
      clientRow.innerHTML += `<td>${gananciaCliente}</td>`; 
    }
    gananciaClientes.appendChild(clientRow);
  }
}
