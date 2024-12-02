// Elementos del DOM
const inputMontoEnClp = document.getElementById('inputClp');
const selectMonedaAConvertir = document.getElementById('monedaAConvertir');
const buttonConvertirGraficar = document.getElementById('convertirGraficarButton');
const pResultadoConversion = document.getElementById('resultadoConversion');
const canvasGraficoValorMoneda10dias = document.getElementById("graficoValorMoneda10dias");

// URL base de la API
const apiUrl = "https://mindicador.cl/api/";

// Obtener datos desde la API
const getMonedas = async (apiEndpointUrl) => {
    try {
        const response = await fetch(apiEndpointUrl);
        if (!response.ok) throw new Error("No se pudo conectar con la API.");
        return await response.json();
    } catch (error) {
        pResultadoConversion.textContent = `Error: ${error.message}`;
        console.error(error);
    }
};

// Renderizar el resultado de la conversión
const renderResultado = async (montoAConvertir, monedaAConvertir) => {
    const monedaData = await getMonedas(`${apiUrl}${monedaAConvertir}`);
    if (!monedaData?.serie?.[0]?.valor) {
        pResultadoConversion.textContent = "No se pudo obtener el valor de la moneda seleccionada.";
        return;
    }
    const tasaCambio = monedaData.serie[0].valor;
    const resultado = montoAConvertir / tasaCambio;
    pResultadoConversion.textContent = `Resultado: $${resultado.toFixed(2)}`;
};

// Preparar configuración del gráfico
const objetoDeConfiguracionParaGrafica = (ultimos10Valores, moneda) => {
    const fechas10UltimosDias = ultimos10Valores.map(item => item.fecha.slice(0, 10));
    const valores10UltimosDias = ultimos10Valores.map(item => item.valor);
    return {
        type: 'line',
        data: {
            labels: fechas10UltimosDias,
            datasets: [{
                label: `Últimos 10 valores de ${moneda.toUpperCase()}`,
                data: valores10UltimosDias,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            }
        }
    };
};

// Renderizar el gráfico
const renderGrafico = async (moneda) => {
    const monedaData = await getMonedas(`${apiUrl}${moneda}`);
    const ultimos10Valores = monedaData.serie.slice(0, 10);
    if (!ultimos10Valores.length) {
        pResultadoConversion.textContent = "No hay datos históricos disponibles para esta moneda.";
        return;
    }
    const config = objetoDeConfiguracionParaGrafica(ultimos10Valores, moneda);
    Chart.getChart("graficoValorMoneda10dias")?.destroy(); // Destruir gráfico existente
    new Chart(canvasGraficoValorMoneda10dias, config);
};

// Evento del botón
buttonConvertirGraficar.addEventListener("click", () => {
    const monto = Number(inputMontoEnClp.value);
    const moneda = selectMonedaAConvertir.value;
    if (monto > 0 && moneda) {
        renderResultado(monto, moneda);
        renderGrafico(moneda);
    } else {
        alert("Por favor ingrese un monto válido y seleccione una moneda.");
        pResultadoConversion.textContent = `...`;
        inputMontoEnClp.value = "";
    }
});
