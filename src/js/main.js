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
        .attr("class", "link")
    .selectAll(".link");

var node = g
    .append("g")
        .attr("class", "node")
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

    node = node.data(graph.nodes);
    node.exit().remove();
    node = node
        .enter()
        .append("g")
        .append("svg")
            .attr("id", d => d.id)
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

    var rect = node.selectAll(".rectangle")
        .data(d => function(d) { return d; });
    rect.exit().remove();
    rect = rect
        .enter()
        .append("rect")
            .attr("class", "rectangle")
            .attr("width", 
                function() 
                { 
                    var keyvalueElements = this.parentElement.getElementsByClassName("keyvalue");
                    var maxWidthOfKeyvalueElements = 0;

                    for (let index = 0; index < keyvalueElements.length; index++) {
                        const element = keyvalueElements[index];   

                        if (element.clientWidth > maxWidthOfKeyvalueElements)
                            maxWidthOfKeyvalueElements = element.clientWidth;
                    }

                    return maxWidthOfKeyvalueElements * 2;
                })
            .attr("height",
                function() 
                { 
                    var numberOfTextElements = this.parentElement.getElementsByClassName("keyvalue").length;
                    return numberOfTextElements * lineHeight + textPadding;
                })
            .merge(rect);

    simulation.nodes(graph.nodes);
    simulation.force("link").links(graph.links);
}

function ticked() 
{
    node
        .attr("x", d => d.x)
        .attr("y", d => d.y);

    link
        .attr("x1", d => d.source.x + getRectangle(d.source.id).width.animVal.value / 2)
        .attr("y1", d => d.source.y + getRectangle(d.source.id).height.animVal.value / 2)
        .attr("x2", d => d.target.x + getRectangle(d.target.id).width.animVal.value / 2)
        .attr("y2", d => d.target.y + getRectangle(d.target.id).height.animVal.value / 2);
}

function getRectangle(id)
{
    var element = document.getElementById(id);
    return element.getElementsByClassName("rectangle")[0];
}