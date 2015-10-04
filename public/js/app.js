// Abstract: En document.ready carga datos y los pone en un csv
var spreadSheet = 'https://docs.google.com/spreadsheets/d/1pi5u6PG25dNusoMDY_zSipP0DsOzwTBiAF6lZTys6MA/edit#gid=509195421';

// Abstract: D3 magic
// Param: @Object = datos CSV  
function dibujoGrafico(datosCSV) {
    $("#consola").html("Dibujando grafico...");

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var xValue = function(d) { return d.Poblacion;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yValue = function(d) { return d["Hogares"];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

var cValue = function(d) { return d.Hogares;},
    color = d3.scale.category20();

// add the graph canvas to the body of the webpage
var svg = d3.select("#grafico").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("#grafico").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.csv("data/dataPartidoHogaresPoblacion.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.Poblacion = +d.Poblacion;
    d.Hogares = +d.Hogares;
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([0, d3.max(data, xValue)+100]);
  yScale.domain([0, d3.max(data, yValue)+100]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Poblacion");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Hogares");

  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));}) 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Partido"])
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

});



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
            dataString = value.cells.Partido + "," + value.cells.Hogares + "," + value.cells.Poblacion;
            datosCSV += dataString + "\n";
        });
    }
    dibujoGrafico(datosCSV);
};

// Abstract: Cargo datos de un spreadsheet, dibuja la tabla y
// llama por callback a una funcion que pasa esos datos a CSV
// Param: @String = ID de la tabla  
function cargaDatos(elemento) {

    sheetrock({
        url: spreadSheet,
        query: "select A,B,C",
        callback: cargoDatosEnArray
    })
}

$(document).ready(function() {
    cargaDatos("#tabla");
});
