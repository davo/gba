// Abstract: En document.ready carga datos y los pone en un array
var spreadSheet = 'https://docs.google.com/spreadsheets/d/1pi5u6PG25dNusoMDY_zSipP0DsOzwTBiAF6lZTys6MA/edit#gid=509195421';

// Abstract: D3 magic
// Param: @Object = datos CSV  
function dibujoGrafico(datos) {
    $("#consola").html("Dibujando grafico...");

    var dataset = cambioDataset(datos);


    var canvas_width = $(window).width() - 100;
    var canvas_height = $(window).height() - 100;
    var padding = 100;

    var xScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {
            return d[0];
        })])
        .range([padding, canvas_width - padding * 2]);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {
            return d[1];
        })])
        .range([canvas_height - padding, padding]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);

    var svg = d3.select("#grafico")
        .append("svg")
        .attr("width", canvas_width)
        .attr("height", canvas_height)

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d[0]);
        })
        .attr("cy", function(d) {
            return yScale(d[1]);
        })
        .attr("r", 2);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (canvas_height - padding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    d3.select("#cambiador")
        .on("change", function() {
            var numValues = dataset.length;
            var maxRange = Math.random() * 1000;
            dataset = cambioDataset(datos);

            xScale.domain([0, d3.max(dataset, function(d) {
                return d[0];
            })]);
            yScale.domain([0, d3.max(dataset, function(d) {
                return d[1];
            })]);

            svg.selectAll("circle")
                .data(dataset)
                .transition()
                .duration(500)
                .each("start", function() {
                    d3.select(this)
                        .attr("opacity", "0.5")
                        .attr("r", 10);
                })
                .delay(function(d, i) {
                    return i / dataset.length * 10;
                })
                .ease("variable") //  'circle', 'elastic', 'bounce', 'linear', 'variable'
                .attr("cx", function(d) {
                    return xScale(d[0]);
                })
                .attr("cy", function(d) {
                    return yScale(d[1]);
                })

            .each("end", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", "1")
                    .attr("r", 2);
            });

            svg.select(".x.axis")
                .transition()
                .duration(1000)
                .call(xAxis);

            svg.select(".y.axis")
                .transition()
                .duration(100)
                .call(yAxis);
        });


    $("#consola").html("Listo...");
    $("#consola").slideUp("slow");
}

// Abstract: convierte un objeto de datos a CSV  
// Param: @String; @Object, @Object  
var cargoDatosEnArray = function(error, options, response) {
    if (!error) {
        var datos = [];
        $("#consola").html("cargando datos.")
        jQuery.each(response.rows, function(index, value) {
            datos.push([value.cells.Partido, value.cells.Hogares, value.cells.Poblacion, value.cells.Hogares, value.cells.Superficie ]);
        });
    }
    dibujoGrafico(datos);
};

// Abstract: Cargo datos de un spreadsheet, dibuja la tabla y
// llama por callback a una funcion que pasa esos datos a un array
// Param: @String = ID de la tabla  
function cargaDatos() {
    sheetrock({
        url: spreadSheet,
        query: "select A,B,C,D,E",
        callback: cargoDatosEnArray
    })
}

// Abstract: Cambio el array de datos a dibujar en el gráfico
// dependiendo los valores que estan en el select
// Param: @object = datos del spreadsheet  
function cambioDataset(datos) {
    var valores = $("#cambiador").val();

    var array_de_datos = [];
    for (var i = 1; i < datos.length - 1; i++) {
        var newNumber1 = +datos[i][valores.split("-")[0]];
        var newNumber2 = +datos[i][valores.split("-")[1]];
        array_de_datos.push([newNumber1, newNumber2]);
    }
    return array_de_datos;
}

$(document).ready(function() {
    cargaDatos();
});
