"use strict";

const rectWidth = 350;
const lineHeight = 24;
const textPadding = 12;

var svg;
var graph;
var links;
var nodes;
var texts;
var rects;

var width = document.getElementById('svg').clientWidth;
var height = document.getElementById('svg').clientHeight;

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(200)
    .size([width, height])
    .on("tick", tick);

function LoadJson(jsonString)
{
    if (jsonString.trim() == "")
        return;

    graph = JSON.parse(jsonString);

    svg = d3.select("svg")

    links = svg.selectAll(".link")
        .data(graph.links);
    links.exit().remove();
    var linksEnter = links
        .enter()
        .append("line")
            .attr("class", "link")
            .style("stroke", "rgb(0,0,0)")
            .style("stroke-width", "1")
            .attr("opacity", "10%");

    nodes = svg.selectAll(".node")
        .data(graph.nodes);
    nodes.exit().remove();
    var nodesEnter = nodes        
        .enter()
        .append("g")
            .attr("class", "node")
        .append("svg");

    texts = nodes.selectAll(".keyvalue")
        .data(d => d.attributes)
    texts.exit().remove();
    var textsEnter = texts
        .enter()
        .append("text")
            .attr("class", "keyvalue")
            .attr("y", (d, i) =>  lineHeight + i * lineHeight)
            .attr("x", textPadding)
            .text(d => d.key + ": " + d.value);

    rects = nodes.selectAll(".rect")
        .data(d => function(d) { return d; });
    rects.exit().remove();
    var rectsEnter = rects
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

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();
}

function rectangleHeight(numberOfTextElements)
{
    return numberOfTextElements * lineHeight + textPadding;
}

function tick() {
    if (links == null || nodes == null)
        return;

    links
        .attr("x1", function (d) { return d.source.x + rectWidth / 2; })
        .attr("y1", function (d) { return d.source.y + rectangleHeight(d.source.attributes.length) / 2 })
        .attr("x2", function (d) { return d.target.x + rectWidth / 2; })
        .attr("y2", function (d) { return d.target.y + rectangleHeight(d.target.attributes.length) / 2 })

    nodes
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; });

    nodes.each(collide(0.5));
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
