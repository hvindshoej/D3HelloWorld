"use strict";

const rectWidth = 350;
const lineHeight = 20;
const textPadding = 12;

var svg = d3.select("svg");

var width = document.getElementById('svg').clientWidth;
var height = document.getElementById('svg').clientHeight;

var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(-500))
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(400))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
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

    link = link.data(graph.links);
    link.exit().remove();
    link = link
        .enter()
        .append("line")
        .merge(link);;

    node = node.data(graph.nodes, function(d) { return d.id;} );
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
            .attr("y", (d, i) =>  lineHeight + i * lineHeight)
            .attr("x", textPadding)
            .text(d => d.key + ": " + d.value)
        .merge(text);

    var rects = node.selectAll(".rectangle")
        .data(d => function(d) { return d; });
    rects.exit().remove();
    rects = rects
        .enter()
        .append("rect")
            .attr("class", "rectangle")
            .attr("width", rectWidth)
            .attr("height",
                function() 
                { 
                    var numberOfTextElements = this.parentElement.getElementsByClassName("keyvalue").length;
                    return rectangleHeight(numberOfTextElements);
                });

    simulation.nodes(graph.nodes);
    simulation.force("link").links(graph.links);
}

function rectangleHeight(numberOfTextElements)
{
    return numberOfTextElements * lineHeight + textPadding;
}

function ticked() 
{
    node
        .attr("x", d => d.x)
        .attr("y", d => d.y);

    link
        .attr("x1", d => d.source.x + rectWidth / 2)
        .attr("y1", d => d.source.y + rectangleHeight(d.source.attributes.length) / 2)
        .attr("x2", d => d.target.x + rectWidth / 2)
        .attr("y2", d => d.target.y + rectangleHeight(d.target.attributes.length) / 2);
}