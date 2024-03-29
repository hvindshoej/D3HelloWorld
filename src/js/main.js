"use strict";

const rectWidth = 350;
const lineHeight = 20;
const textPadding = 12;

var aggregateEventIndex = 0;
var aggregateEventDate = "2099-01-01";

var svg = d3.select("svg");
var nodes = [];

var width = document.getElementById('svg').clientWidth;
var height = document.getElementById('svg').clientHeight;

var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(-2000))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", ticked);

var g = svg
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var node = g
    .append("g")
    .attr("class", "node")
    .selectAll(".node");

function AddJsonNode(newNode)
{
    nodes.push(newNode);
    restart();
}

function restart()
{
    node = node.data(nodes);
    node.exit().remove();
    node = node
        .enter()
        .append("g")
        .append("svg")
            .attr("id", d => d.AggregateId)
            .call(d3.drag()
                .on("drag", function (d)
                {
                    d.x = d3.event.x;
                    d.y = d3.event.y;
                    ticked();
                }))
        .merge(node);

    var text = node.selectAll(".keyvalue")
        .data(
            function(d) {
                for (let index = d.AggregateEvents.length-1; index >= 0; index--) {
                    const element = d.AggregateEvents[index];

                    if (element.EventDate <= aggregateEventDate)
                    {
                        return element.Attributes;
                    }
                }
                return [{"Key": d.AggregateId, "Value": ""}];
            },
            d => d.Key + "-" + d.Value)
    text.exit().remove();
    text = text
        .enter()
        .append("text")
        .attr("class", "keyvalue")
        .attr("y", (d, i) =>  lineHeight + i * lineHeight)
        .attr("x", textPadding)
        .attr("stroke-width", "2px")
        .text(d => d.Key + ": " + d.Value)
        .merge(text);

    text
        .transition()
        .duration(500)
        .attr("stroke-width", "1px")
        
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
                    return Math.max(...Array.from(keyvalueElements, o => o.clientWidth)) * 2;
                })
            .attr("height",
                function() 
                { 
                    var numberOfTextElements = this.parentElement.getElementsByClassName("keyvalue").length;
                    return numberOfTextElements * lineHeight + textPadding;
                })
            .merge(rect);

    simulation.nodes(nodes);
}

function ticked() 
{
    node
        .attr("x", d =>  d.x)
        .attr("y", d =>  d.y);
}

function getRectangle(id) {
    var element = document.getElementById(id);
    return element.getElementsByClassName("rectangle")[0];
}