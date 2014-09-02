var width, height, force, node, nodes, link, links, label, drag, svg, tick, container, zoom;
var graph;
var count = 0;
var selectedNode = null;
var selectedNodeObj = null;
var selectedLink = null;
var selectedLinkObj = null;
var dragNodeObj = null;
var radius = 30;   // base radius for circle
var clickOntoLinks = false;
var translate = [0, 0];
var scale = 1;
var newAddedClickLink = false;
var doubleClickNode = false;

var updateJsonData = function (jsonData) {
    return JSON.parse(jsonData);
};

var log2 = function (val) {
    return Math.log(val) / Math.LN2;
};

var updateSize = function (updatwWidth, updateheight) {
    width = updatwWidth;
    height = updateheight;

    svg.attr("width", width)
    .attr("height", height);

    force.size([width, height]);

    force.start();
}

var multiDrawingD3 = function () {
    console.log("D3-Canvas-2");
    cleanCache();
    //width = 800;
    //height = 800;
    nodes = [];
    links = [];

    force = d3.layout.force()
    .size([width, height])
    .nodes(nodes) // initialize with a single node
    .links(links)
    .linkDistance(200)
    .charge(-600);
    //.charge(0)
    //.on("tick", tick);
    //drag = force.drag()
    drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragging)
        .on("dragend", dragend);

    zoom = d3.behavior.zoom()
       // .center([width/2,height/2])
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    svg = d3.select("#keyWordMap2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .on("dblclick.zoom", null)
        .on("click", clickSVG)
        .on("dblclick", dblclickSVG);
    //.on("click", clickLink);


    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr("viewBox", "0 -5 10 10")
        .attr('refX', 6)
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#000')
            .attr("stroke-width", "1px")
            .attr("fill-opacity", 0.8);

    //svg.append('svg:defs').append('svg:marker')
    //    .attr('id', 'start-arrow')
    //    .attr('viewBox', '0 -5 10 10')
    //    .attr('refX', 4)
    //    .attr('markerWidth', 6)
    //    .attr('markerHeight', 6)
    //    .attr('orient', 'auto')
    //        .append('svg:path')
    //        .attr('d', 'M10,-5L0,0L10,5')
    //        .attr('fill', '#000')
    //        .attr("stroke-width", "1px");

    container = svg.append("g");
    node = container.selectAll(".node");
    link = container.selectAll(".link");
    label = container.selectAll(".label");

    //d3.select("#keyWordMap2").append("input")
    //.attr("class", "inputText2")
    //.attr("type", "text");

    tick = function () {
        //link.attr("x1", function (d) { return d.source.x; })
        //    .attr("y1", function (d) { return d.source.y; })
        //    .attr("x2", function (d) { return d.target.x; })
        //    .attr("y2", function (d) { return d.target.y; });

        //link.attr("d", function (d) {
        //    return 'M' + d.source.x + ',' + d.source.y + ',' + 'L' + d.target.x + ',' + d.target.y;
        //});
        link.each(function () { this.parentNode.insertBefore(this, this); });

        link.attr('d', function (d) {
            var deltaX = d.target.x - d.source.x,
                deltaY = d.target.y - d.source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                sourcePadding = log2(d.source.frequency + 1) * radius,
                targetPadding = log2(d.target.frequency + 1) * radius + 5,
                sourceX = d.source.x + (sourcePadding * normX),
                sourceY = d.source.y + (sourcePadding * normY),
                targetX = d.target.x - (targetPadding * normX),
                targetY = d.target.y - (targetPadding * normY);

            if (d.linkType == "Curve")
                return 'M' + sourceX + ',' + sourceY + 'A' + dist + ',' + dist + ' 0 0,1 ' + targetX + ',' + targetY;
            else if (d.linkType == "Line")
                return 'M' + sourceX + ',' + sourceY + 'L' + targetX + "," + targetY;
            else { throw "No linkType Matched!"; }
        });

        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

        //if without textPath, lable-X,Y should be updated in the tick
        //label.attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
        //     .attr("y", function (d) { return (d.source.y + d.target.y) / 2; })

        if (selectedLinkObj) {
            $(".inputText2").css({
                "left": ((selectedLinkObj.source.x + selectedLinkObj.target.x) / 2 + translate[0]) / scale, "top": ((selectedLinkObj.source.y + selectedLinkObj.target.y) / 2 + translate[1]) / scale, "visibility": "visible"
            });
            $(".inputText2").focus();
        }
    }

    force.on("tick", tick);

    d3.select("#keyWordMap2")
    .on('keydown', keydown)
    .on('keyup', keyup);
}
function zoomed() {
    $(".inputText2").css({ "visibility": "hidden" });
    translate = d3.event.translate;
    //scale = d3.event.scale;
    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    tick();
}
//******************************************************************
//Drag and Click operations
function dragstart(d) {//Start dragging node
    //if (d3.event.defaultPrevented) return;
    //d3.event.sourceEvent.stopPropagation();
    d3.event.sourceEvent.stopPropagation(); // silence other listeners
    d3.select(this).classed("fixed", d.fixed = true);
    dragNodeObj = d3.select(this);
    clickOntoLinks = true;

    var highlightText = d.word;
    $("#textShow").highlight(highlightText, "highlight");
    //console.log("highlightText:" + highlightText);
}
function dragging(d)//drag node
{
    var oldPX = d.px,
        oldPY = d.py,
        oldX = d.x,
        oldY = d.y;
    //if we donot need nodes across
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    //d.px = d3.event.x;
    //d.py = d3.event.y;
    //d.x = d3.event.x;
    //d.y = d3.event.y

    nodes.forEach(function (nodeValue, nodeIndex) {
        if (nodeValue.fixed && nodeValue != d) {
            var deltaX = d.x - nodeValue.x;
            var deltaY = d.y - nodeValue.y;
            var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var sumRadius = log2(d.frequency + 1) * radius + log2(nodeValue.frequency + 1) * radius;
            if (distance <= sumRadius) {
                console.log("Collision Detection");
                d.px = oldPX;
                d.py = oldPY;
                d.x = oldX;
                d.y = oldY;
            }
        }
    });
    tick();
    force.resume();
}
function dragend(d)//end dragging node
{
    $("#textShow").removeHighlight();
    tick();
    force.resume();
}
function dblclick(d) {//double click node
    if (d3.event.defaultPrevented) return;

    console.log("double click node");
    d3.select(this).classed("fixed", d.fixed = false);
    d3.select(this).classed("connecting", d.connecting = false);

    if (d == selectedNodeObj) {
        selectedNodeObj = null;
        selectedNode = null;
    }

    doubleClickNode = true;
}
function oneclick(d) {//one click node
    if (d3.event.defaultPrevented) return;

    console.log("click node");
    if (d.fixed && !d.connecting) {
        $(".inputText2").css({ "visibility": "hidden" });
        $(".inputText2").val("");
        selectedLinkObj = null;
        if (selectedLink) {
            selectedLink.classed("selected", false);
            tick();
        }
        selectedLink = null;

        if (!selectedNode) {
            selectedNode = d3.select(this);
            selectedNodeObj = d;
            d3.select(this).classed("connecting", d.connecting = true);
        }
        else {
            if (selectedNodeObj == d) return; //Self-connected is not allowed
            var depulicatedConnect = false;
            links.forEach(function (linkValue, linkIndex) { // Depulicated connect is not allowed
                if (linkValue.source == selectedNodeObj && linkValue.target == d) {
                    depulicatedConnect = true;
                    return; // it only exits the forEach function but not exits the parent function.
                }
            });
            if (depulicatedConnect) return;

            clickOntoLinks = true;
            selectedNode.classed("fixed", selectedNodeObj.fixed = false);
            selectedNode.classed("connecting", selectedNodeObj.connecting = false);
            selectedNode.classed("connected", selectedNodeObj.connected = true);

            var linkIndex = 0;
            if (links.length != 0)
                linkIndex = links[links.length - 1].linkIndex + 1;

            links.push({ "source": selectedNodeObj, "target": d, "linkName": null, "linkType": "Line", "linkIndex": linkIndex });
            newAddedClickLink = true;
            updateLinkType(links[links.length - 1], true);
            selectedNode = null;
            selectedNodeObj = null;
            d3.select(this).classed("fixed", d.fixed = false);
            d3.select(this).classed("connecting", d.connecting = false);
            d3.select(this).classed("connected", d.connected = true);

            restartLinks();
            restartLabels();

            selectedLinkObj = links[links.length - 1];
        }
    }
    else if (d.fixed && d.connecting) {
        d3.select(this).classed("connecting", d.connecting = false);
        selectedNode = null;
        selectedNodeObj = null;
    }
}
function clickLink(d) // one click link
{
    clickOntoLinks = true;
    //var coordinates = [0, 0];
    //coordinates = d3.mouse(this);
    //var cursorX = coordinates[0];
    //var cursorY = coordinates[1];

    if (d.linkName && d.linkName != "") {
        $(".inputText2").val(d.linkName);
        d.linkName = "";
        restartLabels();
    }

    $(".inputText2").css({ "left": d3.event.x, "top": d3.event.y, "visibility": "visible" });
    $(".inputText2").focus();
    selectedLinkObj = d;
    selectedLink = d3.select(this);
    selectedLink.classed("selected", true);
    //restartLinks();
    //console.log("d3.mouse.x:" + cursorX + " d3.mouse.y:" + cursorY);
    //console.log("d3.event.x:" + d3.event.x + " d3.event.y:"+d3.event.y);
}
function clickSVG(d) {
    console.log("clickSVG" + d3.event.scale);
    if (clickOntoLinks) {
        clickOntoLinks = false;
    }
    else {
        $(".inputText2").css({ "visibility": "hidden" });
        $(".inputText2").val("");
        selectedLinkObj = null;
        if (selectedLink) {
            selectedLink.classed("selected", false);
            tick();
        }
        selectedLink = null;
    }

    var coordinates = [0, 0];
    coordinates = zoom.scaleExtent();
    if (d3.event.ctrlKey)
    {
        var scale = zoom.scale();
        zoom.center([d3.event.x,d3.event.y]);
        scale = scale + 0.5;
        if (scale > coordinates[1]) return;
        zoom.scale(scale);
        zoom.event(svg.transition().duration(800));
        //console.log("+" + zoom.scale());
    }
    else if (d3.event.altKey) {
        var scale = zoom.scale();
        zoom.center([d3.event.x, d3.event.y]);
        scale = scale - 0.5;
        if (scale < coordinates[0]) return;
        zoom.scale(scale);
        zoom.event(svg.transition().duration(800));
        //console.log("-" + zoom.scale());
    }
    else { }

}
//This function is to add blank node for user
function dblclickSVG(d) {
    //selectedNodeObj = null;
    //if (selectedNode)
    //{
    //    selectedNode.classed("connecting", selectedNodeObj.connecting = false);
    //    selectedNode = null;
    //}
    if (doubleClickNode)
    {
        doubleClickNode = false;
        return;
    }
    console.log("double clickSVG");
    var addNewNode = true;
    nodes.forEach(function (nodeValue, nodeIndex) {
        if (nodeValue.word == "")
            addNewNode = false;
    });
    if (addNewNode)
    {
        nodes.push({ "word": "", "frequency": 1, "x": d3.event.x, "y": d3.event.y, "dx": d3.event.x, "dy": d3.event.y });
        restartNodes();
    }
}
//******************************************************************
//Update the concept Name, links and labels of links
var restartLabels = function () { //redrawing Labels
    label = label.data(links);

    console.log(JSON.stringify(links));

    //Data-join: Update
    label.select("textPath").transition().duration(500)
    .text(function (d) { return d.linkName });

    //Data-Join: Enter
    var enterLabel = label.enter().insert("text", ".node")
    .attr("class", "label")
     //if without textPath, we need to set x y for path 
    //.attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
    //.attr("y", function (d) { return (d.source.y + d.target.y) / 2; })
    .attr("text-anchor", "middle")
    .attr("dy", -4)
    .style("font-size", function (d) { return 10 * log2(d.source.frequency + 1) + "px" })
    .append("textPath")
    .attr("xlink:href", function (d) { return "#linkIndex" + d.linkIndex; })
    .attr("startOffset", "50%")
    .text(function (d) { return d.linkName });

    //Data-Join: Exit
    label.exit().remove();

    //force.start();
}
var restartLinks = function () {//redrawing Links

    console.log("linkNum:" + force.links().length);
    console.log("NodesNumafterlinking:" + force.nodes().length);

    link = link.data(links);
    //Data-join: Update
    //link.style('marker-end', 'url(#end-arrow)');

    //Data-Join: Enter
    var enterLink = link.enter().insert("path", ".node")
        .attr("class", "link")
        .attr("id", function (d) { return "linkIndex" + d.linkIndex; })
        .style('marker-end', 'url(#end-arrow)')
        .on("click", clickLink);

    if (newAddedClickLink)
    {
       selectedLink = enterLink;
       enterLink.attr("class", "link selected");
       newAddedClickLink = false;
    }

    //Data-Join: Exit
    link.exit().remove();

    force.start();
}

var restartNodes = function () {//redrawing Nodes
    //Printf for debugging
    console.log("NodeNum:" + force.nodes().length);
    console.log(JSON.stringify(nodes));
    node = node.data(force.nodes(), function (d) { return d.word; });

    //Data-Join : Update
    node.select("circle")
        .transition().duration(500)
        .attr("r", function (d) { return radius * log2(d.frequency + 1); });

    node.select("text")
        .transition().duration(500)
        .style("font-size", function (d) { return Math.min(2 * radius * log2(d.frequency + 1), (2 * radius * log2(d.frequency + 1) - 8) / d.textlength * 24) + "px"; });

    //Data-Join: Enter
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        //.attr("id", function (d) { return d.id; })
        .on("dblclick", dblclick)
        .on("click", oneclick)
        .call(drag);

    nodeEnter.append("circle")
        .attr("class", "circle")
        .attr("r", 0)
        .transition().duration(500)
        .attr("r", function (d) { return radius * log2(d.frequency + 1); });

    nodeEnter.append("text")
        .text(function (d) { return d.word; })
        .style("font-size", function (d) { d.textlength = this.getComputedTextLength(); return "0px"; })
        .transition().duration(500)
        .style("font-size", function (d) { return Math.min(2 * radius * log2(d.frequency + 1), (2 * radius * log2(d.frequency + 1) - 8) / d.textlength * 24) + "px"; })
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

//var analyseNodes = function (jsonData) { //Analyse the textarea/jsonData and update Nodes 
//    graph = JSON.parse(jsonData);// Splat's JsonData to JsObject
//    console.log("graph:" + jsonData);
//    //Add new nodes and update the frequency of words
//    graph.nodes.forEach(function (graphValue, graphIndex) {
//        var sliceIndex = -1;
//        var sliceValue = null;
//        nodes.forEach(function (nodesValue, nodesIndex) {
//            if (nodesValue.word == graphValue.word) {
//                if (nodesValue.frequency != graphValue.frequency) {
//                    nodesValue.frequency = graphValue.frequency;
//                    sliceIndex = nodesIndex;
//                    sliceValue = nodesValue;
//                }
//                else
//                    sliceIndex = null;
//            }
//        });
//        if (sliceIndex != null) {
//            if (sliceIndex != -1) {
//                nodes.splice(sliceIndex, 1, sliceValue);
//            }
//            else {
//                graphValue.id = nodes.length;
//                nodes.push(graphValue);
//            }
//        }
//    });

//    //Delete out-of-view nodes
//    for (var i = 0; i < nodes.length; i++) {
//        if (nodes[i].fixed || nodes[i].connecting || nodes[i].connected) continue;

//        var delFlag = true;
//        graph.nodes.forEach(function (graphValue, graphIndex) {
//            if (graphValue.word == nodes[i].word) {
//                delFlag = false;
//            }
//        });

//        if (delFlag) {
//            nodes.splice(i--, 1);
//        }
//    }

//    restartNodes();
//}
//****************************************************************************
var updateNodeWord = function (inputText2)//Update Node word for Nodes
{
    var selectedNodeIndex = nodes.indexOf(selectedNodeObj);
    nodes.splice(selectedNodeIndex, 1);
    var newAddNode = null;
    nodes.forEach(function (nodeValue, nodeIndex) {
        if (nodeValue.word.toUpperCase() == inputText2.toUpperCase())
        {
            newAddNode = nodeValue;
        }
    });
    if (!newAddNode) {
        newAddNode = JSON.parse(JSON.stringify(selectedNodeObj));
        newAddNode.word = inputText2;
        nodes.push(newAddNode);
    }
    else {
        newAddNode.frequency += selectedNodeObj.frequency;
    }

    links.forEach(function (linkValue, linkIndex) {
        if (linkValue.source == selectedNodeObj)
            linkValue.source = newAddNode;
        else if (linkValue.target == selectedNodeObj)
            linkValue.target = newAddNode;
        else { }
    });

    newAddNode.fixed = false;
    newAddNode.connecting = false;
    newAddNode.connected = false;
    /*
    This part needs update if we set state/style for connected node.
    */
    //selectedNode.classed("connecting", selectedNodeObj.connecting = false);
    //selectedNode.classed("fixed", selectedNodeObj.fixed = false);
    selectedNodeObj = null;
    selectedNode = null;
    restartNodes();
}
var updateLinkLabelName = function (inputText2) //update label name for link
{
    selectedLinkObj.linkName = inputText2;

    selectedLinkObj = null;
    selectedLink.classed("selected", false);
    selectedLink = null;
    restartLabels();
    tick();
    //restartLinks();
    //console.log(inputText2);
};
var delLinkandLabel = function ()//delete selected link and its label
{
    $(".inputText2").css({ "visibility": "hidden" });
    $(".inputText2").val("");
    links.forEach(function (linkvalue, linkIndex) {
        if (linkvalue == selectedLinkObj) {
            links.splice(linkIndex, 1);
            return;
        }
    });
    updateLinkType(selectedLinkObj, false);
    selectedLinkObj = null;
    restartLabels();
    restartLinks();
}
var delNodeWithLink = function ()//delete seleced node and its associated links
{
    nodes.forEach(function (nodeValue, nodeIndex) {
        if (nodeValue == selectedNodeObj) {
            nodes.splice(nodeIndex, 1);
            return;
        }
    });

    for (var i = 0; i < links.length; i++) {
        if (links[i].source == selectedNodeObj || links[i].target == selectedNodeObj)
            links.splice(i--, 1);
    }

    selectedNode = null;
    selecedNodeObj = null;

    restartNodes();
    restartLinks();
    restartLabels();
}
var updateLinkType = function (targetedLink, isLinkAdded) {
    links.forEach(function (linkValue, linkIndex) {
        if (linkValue.source == targetedLink.target && linkValue.target == targetedLink.source) {
            if (isLinkAdded) {
                linkValue.linkType = "Curve";
                targetedLink.linkType = "Curve";
            }
            else
                linkValue.linkType = "Line";

            return;
        }
    });
}
var linkstoNodes = function () {
    links.forEach(function (linkValue, linkIndex) {
        nodes.forEach(function (nodeValue, nodeIndex) {
            if (nodeValue.word.toUpperCase() == linkValue.source.word.toUpperCase()) {
                linkValue.source = nodeValue;
                //console.log("link source == node");
            }
            else if (nodeValue.word.toUpperCase() == linkValue.target.word.toUpperCase()) {
                linkValue.target = nodeValue;
                //console.log("link target == node");
            }
            else { }
        });
    });
};
//**************************************************************************
//Keyboard event
function keyup() {
    if (selectedLinkObj || !selectedNodeObj) return;
    switch (d3.event.keyCode) {
        case 69: //Edit
            if (selectedNodeObj) {
                $(".inputText2").css({
                    "left": selectedNodeObj.x + translate[0], "top": selectedNodeObj.y + translate[1], "visibility": "visible"
                });
                $(".inputText2").focus();
            }
            break;
    }
}

function keydown() {
    //d3.event.preventDefault(); //to stop the default keyboard event

    if (!selectedLinkObj && !selectedNodeObj) return;
    switch (d3.event.keyCode) {
        case 46: //delete
            if (selectedLinkObj) {
                delLinkandLabel();
            }
            if (selectedNodeObj) {
                delNodeWithLink();
            }
            break;
    }
}
//************************************************************************
var saveNoteToFile = function (textContent) {
    var savedString = {};
    savedString.text = textContent;
    savedString.node = nodes;
    savedString.link = links;
    return JSON.stringify(savedString);
}

var cleanCache = function () {
    count = 0;
    selectedNode = null;
    selectedNodeObj = null;
    selectedLink = null;
    selectedLinkObj = null;
    dragNodeObj = null;
    radius = 30;   // base radius for circle
    clickOntoLinks = false;
    translate = [0, 0];
    scale = 1;
}
//************************************************************************
var mergeNodesAndLinks = function (mergeNodes, mergeLinks) {
    if (!mergeNodes) return;

    var nodeCount = nodes.length;
    mergeNodes.forEach(function (mergeNodeValue, mergeNodeIndex) {
        var pushtoNodes = true;
        for (var i = 0; i < nodeCount; i++)
        {
            if (mergeNodeValue.word.toUpperCase() == nodes[i].word.toUpperCase())
            {
                nodes[i].frequency += mergeNodeValue.frequency;
                pushtoNodes = false;
                break;
            }
        }
        if (pushtoNodes)
            nodes.push(mergeNodeValue);
    });

    var linkCount = links.length;
    var addIndex = linkCount;
    mergeLinks.forEach(function (mergeLinkValue, mergeLinkIndex) {
        var pushtoLinks = true;
        for (var i = 0; i < linkCount; i++)
        {
            if (mergeLinkValue.source.word.toUpperCase() == links[i].source.word.toUpperCase() && mergeLinkValue.target.word.toUpperCase() == links[i].target.word.toUpperCase())
            {
                pushtoLinks = false;
                break;
            }
        }
        if (pushtoLinks)
        {
            mergeLinkValue.linkIndex = addIndex++;
            links.push(mergeLinkValue);
        }
    });
}

var removeNodesAndLinks = function (removeNodes, removeLinks) {
    for(var i = 0; i < nodes.length; i++){
        var spliceNode = false;

        var nodeValue = nodes[i];
        removeNodes.forEach(function (removeNodeObj, removeNodeLink) {
            if (nodeValue.word.toUpperCase() == removeNodeObj.word.toUpperCase()) {
                if (nodeValue.frequency == removeNodeObj.frequency) {
                    spliceNode = true;
                }
                else if (nodeValue.frequency > removeNodeObj.frequency) {
                    nodeValue.frequency = nodeValue.frequency - removeNodeObj.frequency;
                }
                else {//This case should not happen.
                    spliceNode = true;
                }
                return;
            }
        });
    
        if (spliceNode) nodes.splice(i--,1);
    }

    for(var i = 0; i < links.length; i++){
        if (nodes.indexOf(links[i].source) == -1 || nodes.indexOf(links[i].target) == -1)
        {
            links.splice(i--,1);
        }
    }
}