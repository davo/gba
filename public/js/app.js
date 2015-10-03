// Abstract: En document.ready carga datos y los pone en un csv
var spreadSheet = 'https://docs.google.com/spreadsheets/d/1pi5u6PG25dNusoMDY_zSipP0DsOzwTBiAF6lZTys6MA/edit#gid=509195421';

// Abstract: D3 magic
// Param: @Object = datos CSV  
function dibujoGrafico(data) {
    $("#consola").html("Dibujando grafico...");






    $("#consola").html("Listo...");
    $("#consola").slideUp("slow");
}

// Abstract: convierte un objeto de datos a CSV  
// Param: @String; @Object, @Object  
var cargoDatosEnArray = function(error, options, response) {
    if (!error) {
        var datosCSV = "";
        $("#consola").html("cargando datos.")
        jQuery.each(response.rows, function(index, value) {
            dataString = value.cells.Partido + "," + value.cells.Hogares + "," + value.cells.Población;
            datosCSV += dataString + "\n";
        });
    } else {
        $("#consola").html("No se cargaron los datos. Intente nuevamente.")
        return false;
    }
    dibujoGrafico(datosCSV);
};

// Abstract: Cargo datos de un spreadsheet, dibuja la tabla y
// llama por callback a una funcion que pasa esos datos a CSV
// Param: @String = ID de la tabla  
function cargaDatos(elemento) {
    $(elemento).sheetrock({
        url: spreadSheet,
        query: "select A,B,C",
        callback: cargoDatosEnArray
    });
}

$(document).ready(function() {
    cargaDatos("#tabla");
});
