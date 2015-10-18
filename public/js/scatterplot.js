var objectGraph = ".content__item--show .grafico";
var radioDefault = 5; //el radio por default si no hay dato de radio
var svg;

// globales que usa el grafico para armarse
// deben updatearse antes de llamar un grafico o updatearlo
var columnaX = 1;
var columnaY = 2;
var radio = 0;
var filtro = "";
var height = "";
var width = "";

// Abstract: Cambio el array de datos a dibujar en el gráfico
// dependiendo los valores que estan en el select
// Param: @object = datos del spreadsheet  
function updateKeys() {
    //saco medidas para recalcular el grafico (RES)
    height = $(".grafico").height();
    width = $(".grafico").width();

    //estas variables deben popularse al seleccionar una historia o tarjeta
    columnaX = Math.floor((Math.random() * 32) + 1);
    columnaY = Math.floor((Math.random() * 32) + 1);
    radio = Math.floor((Math.random() * 32) + 1);
    filtro = "";
}

// Abstract: Cambio el array de datos a dibujar en el gráfico
// dependiendo los valores que estan en el select
// Param: @object = datos del spreadsheet  
function cambioDataset(datos) {
    var array_de_datos = [];

    for (var i = 1; i < datos.length - 1; i++) {
        var nombrePartido = datos[i][0];
        var dato1TMP = +datos[i][columnaX];
        var dato2TMP = +datos[i][columnaY];
        if (radio > 0) {
            radioTMP = +datos[i][radio];
        } else {
            radioTMP = +radioDefault;
        }


        radioTMP = +radioDefault;
        array_de_datos.push([nombrePartido, dato1TMP, dato2TMP, radioTMP]);
    }

    return array_de_datos;
}

// Abstract: Crea el scatterplot
// Param: @Array = datos  
function addGraph() {
    var dataset = cambioDataset(datosTotales);

    var padding = 50;

    xScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {
            return d[1];
        })])
        .range([padding, width - padding]);

    yScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {
            return d[2];
        })])
        .range([height - padding, padding]);

    xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

    yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);

    svg = d3.select(objectGraph).append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('viewBox', '0 0 ' + Math.max(width, height) + ' ' + Math.min(width, height))
        .attr('preserveAspectRatio', 'xMinYMin');

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", "circulo")
        .attr("cx", function(d) {
            return xScale(d[1]);
        })
        .attr("cy", function(d) {
            return yScale(d[2]);
        })
        .attr("r", function(d) {
            if (radio) {
                return d[3];
            } else {
                return radioDefault;
            }
        })
        .attr("value", function(d) {
            return d[0]
        })
        .on("mouseover", function(d) {
            console.log(d[0]);
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("id", "yAxis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    d3.select(".content__item--show #cambiador")
        .on("change", function() {
            updateGraph();
        });
};

// Abstract: Cambia la posicion de los puntos del scatterplot
// al value del select que esté seleccionado
function updateGraph() {

    var dataset = cambioDataset(datosTotales);

    xScale.domain([0, d3.max(dataset, function(d) {
        return d[1];
    })]);
    yScale.domain([0, d3.max(dataset, function(d) {
        return d[2];
    })]);

    svg.selectAll("circle")
        .data(dataset)
        .transition()
        .duration(500)
        .each("start", function() {
            d3.select(this)
                .attr("class", "circulo");

            /*function(d, i) {
                filtro = filtro.split(",");
                for (var i = 0; i < filtro.length; i++) {
                    if (!filtro[i].trim().indexOf(d[0])) {
                        return "circulo";
                    }
                }
                return "circuloDim";
            });*/
        })
        .delay(function(d, i) {
            return i / dataset.length * 10;
        })
        .ease("variable")
        .attr("cx", function(d) {
            return xScale(d[1]);
        })
        .attr("cy", function(d) {
            return yScale(d[2]);
        })

    .each("end", function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", function(d) {
                if (radio > 0) {
                    console.log (d[3]);
                    return d[3];
                } else {
                    return radioDefault;
                }

            });
    });

    svg.select(".x.axis")
        .transition()
        .duration(800)
        .call(xAxis);

    svg.select(".y.axis")
        .transition()
        .duration(800)
        .call(yAxis);
};

// da de baja el grafico
function removeGraph() {
    $("svg").remove();
};


// si existe el grafico lo updatea
// si NO existe lo genera
function manageGraph() {
    updateKeys();
    if ($(objectGraph + " svg").length > 0) {
        updateGraph();
    } else {
        addGraph();
        updateGraph();
    }

}
