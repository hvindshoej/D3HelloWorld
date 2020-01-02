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
    .size([width, height]);

force.on(
    "tick", 
    function () 
    {
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
    });

var node_drag = d3.behavior.drag()
    .on("dragstart", dragstart)
    .on("drag", dragmove)
    .on("dragend", dragend);

function LoadJson(jsonString)
{
    if (jsonString.trim() == "")
        return;

    graph = JSON.parse(jsonString);

    svg = d3.select("svg")

    links = svg.selectAll(".link")
        .data(graph.links)
        .enter()
        .append("line")
            .attr("class", "link")
            .style("stroke", "rgb(0,0,0)")
            .style("stroke-width", "1")
            .attr("opacity", "10%");

    nodes = svg.selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .append("svg")
        .on('dblclick', releasenode)
        .call(node_drag);

    texts = nodes.selectAll("text")
        .data(d => d.attributes)
        .enter()
        .append("text")
            .attr("class", "keyvalue")
            .attr("y", (d, i) =>  lineHeight + i * lineHeight)
            .attr("x", textPadding)
            .text(d => d.key + ": " + d.value);

    rects = nodes.selectAll("rect")
        .data(d => function(d) { return d; })
        .enter()
        .append("rect")
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

function dragstart(d, i) {
    force.stop() // stops the force auto positioning before you start dragging
}

function dragmove(d, i) {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
}

function dragend(d, i) {
    d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    force.resume();
}

function releasenode(d) {
    d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    force.resume();
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
