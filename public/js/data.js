// Carga datos para armar los gráficos
// y los storea en variables globales

'use strict'

//URL a las hojas de datos y var globales.
var urlSpreadsheet = "https://docs.google.com/spreadsheets/d/1DmE7yv8JmUIpQQ1lhEam6e33aslSg84Gws2VJbmjnQo/edit#gid=1860459801",
    datosTotales = [],
    centroides = [],
    mapaDatos,
    ejeActual = "",
	width = 500,
    height = 300;


// Abstract: Cargo datos de un spreadsheet y hace
// un callback que pasa esos datos a un array
function cargaDatos() {
    var dataTemporal = sheetrock({
        url: urlSpreadsheet,
        query: "select *",
        callback: cargoDatosEnArray
    });
    cargoMapa();
}

// Abstract: convierte un objeto de datos un array
// Param: @String; @Object, @Object  
var cargoDatosEnArray = function(error, options, response) {
    if (!error) {
        jQuery.each(response.rows, function(index, value) {
            var fila = [];
            for (var i = 0; i < value.cellsArray.length; i++) {
                fila.push(value.cellsArray[i])
            }
            datosTotales.push(fila);
        });
    }
};

// Abstract: carga topojson y lo deja listo en var global
function cargoMapa() {
   	d3.json("data/gba.json", function(error, gba) {
    	if (!error){
    		mapaDatos = gba; 
    	} else {
    		console.log ("no se pudo cargar json de mapa", error);
    	}
    });
}

// carga los datos de la planilla
cargaDatos();
