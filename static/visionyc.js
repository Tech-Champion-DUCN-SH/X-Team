
var vis, zm;

var padding = {
    top : 40,
    right : 30,
    bottom : 30,
    left : 30
}


var wid, hei;

var scales = {};

var data;

var margin = 60;

var model = {
    sub_v_br_eth: { width: 100, height: 30},
    sub_v_br: { width: 150, height: 100},
    br_int:   { width: 0, height: 150},
    linux_br: { width: 70, height: 30},
    vm:       { width: 200, height: 60}
};

$(function() {

    vis = d3.select("#chart")
        .call(zm=d3.behavior.zoom().on('zoom', redraw));

    wid = $('#chart').width(),
        hei = window.innerHeight - $('#navigation').height() - margin;


    load_network_info();


    $('#reset-button').click(function() {
        load_network_info();
    });
});

function load_network_info(){
    d3.json('data/l2data.json', function(json) {

        data = json;
        $('svg').remove();
        vis = d3.select('#chart').append('svg')
            .attr('width', wid)
            .attr('height', hei);

        processData();
        drawStarting();
    });
};

function redraw() {

    console.log(zm.scale(), zm.translate());

    vis.selectAll("rect").attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    vis.selectAll("text").attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    vis.selectAll("line").attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");

};


var vm_margin, sub_br_margin;
var lines = [];
/************************************************************
 * Process the data once it's imported
 ***********************************************************/
function processData() {

    var linux_bridge_width = data.linux_bridge.length * ( model.linux_br.width + padding.left) - padding.left
    scales.linux_br = d3.scale.linear()
        .domain([0, linux_bridge_width])
        .range([padding.left, wid - padding.right]);
    lines = [];
    // var vm_width = data.vswitches.length * ( model.vm.width + padding.left) - padding.left
    // scales.linux_vm = d3.scale.linear()
    //                 .domain([0, vm_width])
    //                 .range([padding.left, wid - padding.right]);


    scales.y_position = d3.scale.linear()
        .domain([0, 3])
        .range([padding.top, hei - padding.bottom - model.sub_v_br.height]);

    vm_margin = ( linux_bridge_width - 60 ) / data.vms.length - model.vm.width;
    sub_br_margin = ( linux_bridge_width - 60 ) / data.vswitches.length - model.sub_v_br.width;


/*
    $.each(data.linux_bridge,function(i, br) {
        var lineColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
        var x1 = scales.linux_br(i * (model.vm.width + vm_margin) + vm_margin/2 + model.vm.width/2);
        var y1 = scales.y_position(0) + (scales.linux_br(model.linux_br.width) - scales.linux_br(0))* 0.7;

        var index = _.indexOf( data.linux_bridge, br.name);
        var x2 = scales.linux_br(index * ( model.linux_br.width + padding.left) + model.linux_br.width/2);
        var y2 = scales.y_position(1);


        lines.push(new Line(x1, y1, x2, y2, lineColor));

    });
*/


    $.each(data.linux_bridge,function(i, br) {
//        var lineColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
            var lineColor = "DarkOrange";
        var x1 = scales.linux_br(i * ( model.linux_br.width + padding.left) + model.linux_br.width/2);
        var y1 = scales.y_position(1);

        var index = _.indexOf( data.vms, br.vm);
        var x2 = scales.linux_br(index * (model.vm.width + vm_margin) + vm_margin/2 + model.vm.width/2);
        var y2 = scales.y_position(0) + (scales.linux_br(model.linux_br.width) - scales.linux_br(0))* 0.7;
        lines.push(new Line(x1, y1, x2, y2, lineColor));

    }
    );


    $.each(data.linux_bridge,function(i, br) {
//        var lineColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
        var x1 = scales.linux_br(i * ( model.linux_br.width + padding.left) + model.linux_br.width/2);
        var y1 = scales.y_position(1) + (scales.linux_br(model.linux_br.width) - scales.linux_br(0))* 0.7;
        var x2 = wid - wid*7/8 + (wid - wid*2/8)/2;
        var y2 = scales.y_position(2);

        lines.push(new Line(x1, y1, x2, y2, "ForestGreen"));
    });

    $.each(data.vswitches,function(i, br) {
//        var lineColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
        var x1 = wid - wid*7/8 + (wid - wid*2/8)/2;
        var y1 = scales.y_position(2) + hei/10;
        var x2 = scales.linux_br(i * (model.sub_v_br.width + sub_br_margin) + sub_br_margin/2 + model.sub_v_br.width/2);
        var y2 = scales.y_position(3);

        lines.push(new Line(x1, y1, x2, y2, "Black"));
    });
};

var Line = function(x1,y1,x2,y2,color){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
};

/************************************************************
 * Initial rendering of the vis
 ***********************************************************/
function drawStarting() {

    vis.selectAll("g.vm")
        .data(data.vms)
        .enter()
        .append("svg:rect")
        .attr("class", "vm")
        .attr("x", function(d, i) {
            return  scales.linux_br(i * (model.vm.width + vm_margin) + vm_margin/2) })
        .attr("y", scales.y_position(0))
        .attr("width", scales.linux_br(model.vm.width) - scales.linux_br(0) )
        .attr("height", (scales.linux_br(model.linux_br.width) - scales.linux_br(0))* 0.7)
        .style("fill", "#c1ffbc");

    vis.selectAll("g.vm_name")
        .data(data.vms)
        .enter()
        .append("svg:text")
        .style("text-anchor", "middle")
        .attr("class", "vm_name")
        .attr("x",function(d, i) {
            return  scales.linux_br(i * (model.vm.width + vm_margin) + vm_margin/2 + model.vm.width/2) })
        .attr("y", scales.y_position(0) + (scales.linux_br(model.linux_br.width) - scales.linux_br(0))* 0.35)
        .attr("dx", 5)
        .attr("dy", ".35em")
        .text(function(d) {
            return d;
        });

    vis.selectAll("g.linux_br")
        .data(data.linux_bridge)
        .enter()
        .append("svg:rect")
        .attr("class", "linux_br")
        .attr("x", function(d, i) {
            return  scales.linux_br(i * ( model.linux_br.width + padding.left)) })
        .attr("y", scales.y_position(1))
        .attr("width",  scales.linux_br(model.linux_br.width) - scales.linux_br(0))
        .attr("height", (scales.linux_br(model.linux_br.width) - scales.linux_br(0))* 0.7)
        .style("fill", "#9999ff")
        .append("svg:title")
        .text(function(d) { return d.name; });

    vis.selectAll("g.linux_br")
            .data(data.linux_bridge)
            .exit()
            .remove();

    vis.selectAll("g.linux_br_name")
        .data(data.linux_bridge)
        .enter()
        .append("svg:text")
        .style("text-anchor", "middle")
        .attr("class", "linux_br")
        .attr("x",function(d, i) {
            return  scales.linux_br(i * ( model.linux_br.width + padding.left) + model.linux_br.width / 2) })
        .attr("y", scales.y_position(1) + (scales.linux_br(model.linux_br.width) - scales.linux_br(0))* 0.35)
        .attr("font-size", "1px")
        .text(function(d) {
            return "bridge";
        });



    vis.selectAll("g.br_int")
        .data([1])
        .enter()
        .append("svg:rect")
        .attr("class", "br_int")
        .attr("x", wid - wid*7/8)
        .attr("y", scales.y_position(2) )
        .attr("width", wid - wid*2/8)
        .attr("height", hei/10)
        .style("fill", "#ff8080");

    vis.selectAll("g.br_int_name")
        .data([1])
        .enter()
        .append("svg:text")
        .style("text-anchor", "middle")
        .attr("class", "br_int_name")
        .attr("x",function(d, i) {
            return  wid - wid*7/8 +  (wid - wid*2/8)/2})
        .attr("y", scales.y_position(2) + hei/20)
        .attr("dx", 5)
        .attr("dy", ".35em")
        .attr("font-size", "15px")
        .text(function(d) {
            return "br_int";
        });

    vis.selectAll("g.sub_v_br")
        .data(data.vswitches)
        .enter()
        .append("svg:rect")
        .attr("class", "sub_v_br")
        .attr("x", function(d, i) {
            return  scales.linux_br(i * (model.sub_v_br.width + sub_br_margin) + sub_br_margin/2) })
        .attr("y", scales.y_position(3) )
        .attr("width", scales.linux_br(model.sub_v_br.width) - scales.linux_br(0) )
        .attr("height",  (scales.linux_br(model.sub_v_br.width) - scales.linux_br(0))* 0.7)
        .style("fill", "LightSkyBlue");

    vis.selectAll("g.sub_v_br_name")
        .data(data.vswitches)
        .enter()
        .append("svg:text")
        .style("text-anchor", "middle")
        .attr("class", "sub_v_br_name")
        .attr("x",function(d, i) {
            return  scales.linux_br(i * (model.sub_v_br.width + sub_br_margin) + sub_br_margin/2 + model.sub_v_br.width/2)})
        .attr("y", scales.y_position(3) + (scales.linux_br(model.sub_v_br.width) - scales.linux_br(0))* 0.35)
        .attr("dx", 5)
        .attr("dy", ".35em")
        .attr("font-size", "15px")
        .text(function(d) {
            return d.sub_br;
        });

    vis.selectAll("g.sub_v_br_eth")
        .data(data.vswitches)
        .enter()
        .append("svg:rect")
        .attr("class", "sub_v_br_eth")
        .attr("x", function(d, i) {
            return  scales.linux_br(i * (model.sub_v_br.width + sub_br_margin) + sub_br_margin/2 + (model.sub_v_br.width - model.sub_v_br_eth.width)/2) })
        .attr("y", scales.y_position(3) + (scales.linux_br(model.sub_v_br_eth.width) - scales.linux_br(0))* 0.75)
        .attr("width", scales.linux_br(model.sub_v_br_eth.width) - scales.linux_br(0) )
        .attr("height",  (scales.linux_br(model.sub_v_br_eth.width) - scales.linux_br(0))* 0.5)
        .style("fill", "yellow");

    vis.selectAll("g.sub_v_br_eth_name")
        .data(data.vswitches)
        .enter()
        .append("svg:text")
        .style("text-anchor", "middle")
        .attr("class", "sub_v_br_eth_name")
        .attr("x",function(d, i) {
            return  scales.linux_br(i * (model.sub_v_br.width + sub_br_margin) + sub_br_margin/2 + model.sub_v_br.width/2)})
        .attr("y", scales.y_position(3) + (scales.linux_br(model.sub_v_br_eth.width) - scales.linux_br(0))* 0.95)
        .attr("dx", 5)
        .attr("dy", ".35em")
        .attr("font-size", "15px")
        .text(function(d) {
            return d.out_port;
        });

    vis.selectAll("g.line")
        .data(lines)
        .enter()
        .append("svg:line")
        .style("stroke", function(d){return d.color;})
        .attr("x1",function(d){return d.x1;})
        .attr("y1",function(d){return d.y1;})
        .attr("x2",function(d){return d.x1;})
        .attr("y2",function(d){return d.y1;})
        .transition().delay(500).duration(1500)
        .attr("x2",function(d){return d.x2;})
        .attr("y2",function(d){return d.y2;});

    vis.selectAll("g.line")
            .data(lines)
            .exit()
            .remove();
};


