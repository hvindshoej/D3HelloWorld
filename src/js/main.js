"use strict";

const rectWidth = 350;
const lineHeight = 24;
const textPadding = 12;

var svg = d3.select("svg");

var nodes = [];
var links = [];

var width = document.getElementById('svg').clientWidth;
var height = document.getElementById('svg').clientHeight;

var simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-500))
    .force("link", d3.forceLink(links).distance(500))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .alphaTarget(1)
    .on("tick", ticked);

var g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var link = g
    .append("g")
        .attr("stroke", "rgb(0,0,0)")
        .attr("stroke-width", 1)
        .attr("opacity", "10%")        
    .selectAll(".link");

var node = g
    .append("g")
        .attr("stroke", "rgb(0,0,0)")
        .attr("stroke-width", 1)
    .selectAll(".node");

function LoadJson(jsonString)
{
    var graph = JSON.parse(jsonString);
    links = graph.links;
    nodes = graph.nodes;

    link = link.data(links);
    link.exit().remove();
    link = link
        .enter()
        .append("line")
        .merge(link);;

    node = node.data(nodes, function(d) { return d.id;} );
    node.exit().remove();
    node = node
        .enter()
        .append("g")
        .append("svg")
        .merge(node);

    var text = node.selectAll(".keyvalue")
        .data(d => d.attributes)
    text.exit().remove();
    text = text
        .enter()
        .append("text")
            .attr("class", "keyvalue")
            .attr("stroke", "rgb(0,0,0)")
            .attr("y", (d, i) =>  lineHeight + i * lineHeight)
            .attr("x", textPadding)
            .text(d => d.key + ": " + d.value)
        .merge(text);

    var rects = node.selectAll(".rect")
        .data(d => function(d) { return d; });
    rects.exit().remove();
    rects = rects
        .enter()
        .append("rect")
            .attr("class", "keyvalue")
            .attr("width", rectWidth)
            .attr("height",
                function() 
                { 
                    var numberOfTextElements = this.parentElement.getElementsByClassName("keyvalue").length;
                    return rectangleHeight(numberOfTextElements); 
                })
            .style("stroke", "rgb(0,0,255)")
            .attr("opacity", "10%");

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
}

function rectangleHeight(numberOfTextElements)
{
    return numberOfTextElements * lineHeight + textPadding;
}

function collide(alpha) {
    var padding = 100,
    radius = 80;

    var quadtree = d3.geom.quadtree(graph.nodes);
    return function (d) {
        var rb = 2 * radius + padding,
            nx1 = d.x - rb,
            nx2 = d.x + rb,
            ny1 = d.y - rb,
            ny2 = d.y + rb;
        quadtree.visit(function (quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y);
                if (l < rb) {
                    l = (l - rb) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}

function ticked() 
{
    node
        .attr("x", function(d) 
        { 
            //console.log(d);
            return d.x; 
        })
        .attr("y", function(d) 
        { 
            //return 0;
            return d.y; 
        });

    link
        .attr("x1", function (d) 
        {
            return d.source.x + rectWidth / 2; 
        })
        .attr("y1", function (d) 
        {
            return d.source.y + rectangleHeight(d.source.attributes.length) / 2;
        })
        .attr("x2", function (d) 
        {
             return d.target.x + rectWidth / 2; 
        })
        .attr("y2", function (d) 
        { 
            return d.target.y + rectangleHeight(d.target.attributes.length) / 2;
        });
}