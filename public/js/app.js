// Abstract: En document.ready carga datos y los pone en un array
var spreadSheet = 'https://docs.google.com/spreadsheets/d/1pi5u6PG25dNusoMDY_zSipP0DsOzwTBiAF6lZTys6MA/edit#gid=509195421';
var hayDatos = false;
// Abstract: D3 magic
// Param: @Object = datos CSV  
function dibujoGrafico(datos) {
    cargaMapa();

    var dataset = cambioDataset(datos);
    var radio = 5;
    var canvas_width = $("#grafico").width();
    var canvas_height = $("#grafico").height();
    var padding = 50;

    var xScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {
            return d[0];
        })])
        .range([padding, canvas_width - padding]);

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

    var svg = d3.select("svg")
        .append("g")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('viewBox', '0 0 ' + Math.max(canvas_width, canvas_height) + ' ' + Math.min(canvas_width, canvas_height))
        .attr('preserveAspectRatio', 'xMinYMin');

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
        .attr("r", radio);

    svg.append("g")
        .attr("class", "x axis")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + (canvas_height - padding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("id", "yAxis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    d3.select("#cambiador")
        .on("change", function() {

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
                        .attr("opacity", "0.5");
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
                    .attr("r", radio);
            });

            svg.select(".x.axis")
                .transition()
                .duration(800)
                .call(xAxis);

            svg.select(".y.axis")
                .transition()
                .duration(800)
                .call(yAxis);
        });

    if (!hayDatos) {
        $("#grafico").prepend("<span>No se pudieron cargar los datos. Estos datos son genéricos</span>")
    }
    $("#consola").html("");
    $("#consola").slideUp("fast");
}

// Abstract: convierte un objeto de datos a CSV  
// Param: @String; @Object, @Object  
var cargoDatosEnArray = function(error, options, response) {
    var datos = [];
    if (!error) {
        jQuery.each(response.rows, function(index, value) {
            datos.push([value.cells.Partido,
                value.cells.Poblacion,
                value.cells.Hogares,
                value.cells.Superficie,
                value.cells.Establecimientos
            ]);
        });
        hayDatos = true;
    } else {

        //lleno con datos falsos
        for (var i = 0; i < 30; i++) {
            var linea = [];
            for (var p = 0; p < 5; p++) {
                if (p === 0) {
                    linea.push("Partido " + i);
                } else {
                    linea.push((Math.random() * 100).toFixed() + 30);
                }
            }
            datos.push(linea);
        };
    }


    dibujoGrafico(datos);
};

// Abstract: Cargo datos de un spreadsheet, dibuja la tabla y
// llama por callback a una funcion que pasa esos datos a un array
// Param: @String = ID de la tabla  
function cargaDatos() {

    var archivo = sheetrock({
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
        var newNumber3 = +datos[i][0];
        array_de_datos.push([newNumber1, newNumber2, newNumber3]);
    }
    return array_de_datos;
}


// Abstract: Cambia el ancho y alto del svg del gráfico
// Esto no tiene mucho sentido si el div que
// lo contiene es de ancho y alto fijos.
function responsiveSVG() {
    $("svg").width($("#grafico").width());
    $("svg").height($("#grafico").height());
}


// Abstract: carga el mapa en el div de mapa.
function cargaMapa() {
    var width = $("#grafico").width(),
        height = $("#grafico").height();

    var projection = d3.geo.mercator()
        .center([-58.40000, -34.58900])
        .scale(28000)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#grafico").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('viewBox', '0 0 ' + Math.max(width, height) + ' ' + Math.min(width, height))
        .attr('preserveAspectRatio', 'xMinYMin');

    d3.json("data/gba.json", function(error, gba) {
        svg.append("path")
            .attr("id","mapa")
            .attr("class","invisible")
            .datum(topojson.feature(gba, gba.objects.conurbano))
            .attr("d", path);
    });
}



//listeners
$(window).on("resize", function() {
    responsiveSVG();
});

$(document).ready(function() {
    cargaDatos();
});

$("#verMapa").click(function() {
    if ( $(this).prop('checked') ){
        $("#mapa").attr("class","visible");
        $("#cambiador").attr("class","invisible");
        $("#xAxis").attr("class", "x axis invisible");
        $("#yAxis").attr("class", "y axis invisible");
    }else{
        $("#mapa").attr("class","invisible")
        $("#cambiador").attr("class","visible");
        $("#xAxis").attr("class", "x axis visible");
        $("#yAxis").attr("class", "y axis visible");
    }

});
