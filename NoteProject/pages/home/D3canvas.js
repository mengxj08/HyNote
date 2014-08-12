var width, height, force, node, nodes, link, links, drag, svg;
var graph;
var count = 0;
var selectedNode = null;
var selectedNodeObj = null;

var updateJsonData = function (jsonData) {
    return JSON.parse(jsonData);  
};

var drawingD3 = function () {
    
    width = 800;
    height = 800;
    nodes = [];
    links = [];

    force = d3.layout.force()
    .size([width, height])
    .nodes(nodes) // initialize with a single node
    .links(links)
    .linkDistance(200)
    .charge(-600)
    .on("tick", tick);
    drag = force.drag().on("dragstart", dragstart);

    svg = d3.select("#keyWordMap").append("svg")
        .attr("width", width)
        .attr("height", height);
        //.on("mousemove", mousemove)
        //.on("mousedown", mousedown);

    //svg.append("rect")
    //    .attr("width", width)
    //    .attr("height", height);

    //nodes = force.nodes();
    //links = force.links();
    //force.start();

    node = svg.selectAll(".node");
    link = svg.selectAll(".link");

    //restartLinks();
    //restartNodes();

    //link = link.data(graph.links)
    //    .enter().append("line")
    //    .attr("class", "link");

    //node = node.data(graph.nodes)
    //  .enter().append("g")
    //    .attr("class", "node")
    //    .on("dblclick", dblclick)
    //    .on("click",oneclick)
    //    .call(drag);

    //node.append("circle")
    //    .attr("class", "circle")
    //    .attr("r", function (d) { return 30 * d.frequency;});
        
    
    //node.append("text")
    //    .text(function (d) { return d.word; })
    //    .style("font-size", function (d) { return Math.min(2 * 30 * d.frequency, (2 * 30 * d.frequency - 8) / this.getComputedTextLength() * 24) + "px"; })
    //    .attr("dy", ".35em");

    function tick() {
        link.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    }
}
function dragstart(d) {
    //if (d3.event.defaultPrevented) return;
    //d3.event.sourceEvent.stopPropagation();
    //if (!d.connected)
    //{
    d3.select(this).classed("fixed", d.fixed = true);
    //}
    console.log("drag:" + d);
}

function dblclick(d) {
    if (d3.event.defaultPrevented) return;

    console.log("double click:" + d);
    d3.select(this).classed("fixed", d.fixed = false);
    d3.select(this).classed("connecting", d.connecting = false);
}
function oneclick(d) {

    if (d3.event.defaultPrevented) return;

    console.log("oneClick-fixed:" + d.fixed);
    console.log("oneClick-connecting:" + d.connecting);
    if (d.fixed && !d.connecting) {
        if (!selectedNode) {
            selectedNode = d3.select(this);
            selectedNodeObj = d;
            d3.select(this).classed("connecting", d.connecting = true);
        }
        else {
            //d3.select(selectedNode).classed("fixed", selectedNode.fixed = false);
            selectedNode.classed("fixed", selectedNodeObj.fixed = false);
            selectedNode.classed("connecting", selectedNodeObj.connecting = false);
            selectedNode.classed("connected", selectedNodeObj.connected = true);
            //console.log(selectedNodeObj.index);
            links.push({ "source": selectedNodeObj, "target": d, "linkName": null });
            selectedNode = null;
            selectedNodeObj = null;
            d3.select(this).classed("fixed", d.fixed = false);
            d3.select(this).classed("connecting", d.connecting = false);
            d3.select(this).classed("connected", d.connected = true);

            restartLinks();
        }
    }
    else if (d.fixed && d.connecting) {
        d3.select(this).classed("connecting", d.connecting = false);
        selectedNode = null;
        selectedNodeObj = null;
    }
}
function restartLinks() {
    console.log("linkNum:" + force.links().length);
    console.log("NodesNumafterlinking:" + force.nodes().length);
    link = link.data(links);
    link.enter().insert("line", ".node")
        .attr("class", "link");

    force.start();
}

var restartNodes = function(jsonData) {
    graph = JSON.parse(jsonData);// Splat's JsonData to JsObject
    console.log("graph:" + jsonData);

    //nodes = force.nodes(graph.nodes);
    //force.nodes(graph.nodes);
    //nodes = force.nodes();
    //nodes.push(graph.nodes[count++]);

    //Add new nodes and update the frequency of words
    graph.nodes.forEach(function (graphValue, graphIndex) {
        var sliceIndex = -1;
        var sliceValue = null;
        nodes.forEach(function (nodesValue, nodesIndex) {
            if(nodesValue.word == graphValue.word)
            {
                if (nodesValue.frequency != graphValue.frequency) {
                    nodesValue.frequency = graphValue.frequency;
                    sliceIndex = nodesIndex;
                    sliceValue = nodesValue;
                }
                else
                    sliceIndex = null;
            }
        });
        if (sliceIndex != null)
        {
            if (sliceIndex != -1) {
                nodes.splice(sliceIndex, 1, sliceValue);
            }
            else
            {
                graphValue.id = nodes.length;
                nodes.push(graphValue);
            }
        }
    });

    //Delete out-of-view nodes
    for (var i = 0; i < nodes.length; i++)
    {
        if(nodes[i].fixed || nodes[i].connecting || nodes[i].connected) continue;

        var delFlag = true;
        graph.nodes.forEach(function (graphValue, graphIndex) {
            if (graphValue.word == nodes[i].word)
            {
                delFlag = false;
            }
        });

        if (delFlag)
        {
            nodes.splice(i--, 1);
        }
    }

    //Printf for debugging
    console.log("NodeNum:" + force.nodes().length);
    console.log(JSON.stringify(nodes));
    node = node.data(force.nodes(), function (d) { return d.word; });

    //Data-Join : Update
    node.select("circle")
        .transition().duration(500)
        .attr("r", function (d) { return 30 * d.frequency; });


    node.select("text")
        .transition().duration(500)
        .style("font-size", function (d) { console.log(d.word + "-1-" + this.getComputedTextLength() + "-2-" + d.textLength); return Math.min(2 * 30 * d.frequency, (2 * 30 * d.frequency - 8) / d.textlength * 24) + "px"; });

    //Data-Join: Enter
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("id", function (d) { return d.id;})
        .on("dblclick", dblclick)
        .on("click", oneclick)
        .call(drag);

    nodeEnter.append("circle")
        .attr("class", "circle")
        .attr("r", 0)
        .transition().duration(500)
        .attr("r", function (d) { return 30 * d.frequency; });


    nodeEnter.append("text")
        .text(function (d) { return d.word; })
        .style("font-size",function(d){d.textlength = this.getComputedTextLength(); return "0px";})
        .transition().duration(500)
        .style("font-size", function (d) { return Math.min(2 * 30 * d.frequency, (2 * 30 * d.frequency - 8) / d.textlength * 24) + "px"; })
        .attr("dy", ".35em");

    //Data-Join: Exit
    node.exit().select("circle")
        .transition().duration(500)
        .attr("r", 0);

    node.exit().select("text")
        .transition().duration(500)
        .style("font-size", "0px");

    node.exit().transition().duration(500).remove();
    force.start();
}