const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

let graph_width = (MAX_WIDTH * 3 / 4), graph_height = MAX_HEIGHT / 2;

let svg = d3.select("#graph")
    .append("svg")
    .attr('width', graph_width)
    .attr('height', graph_height)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let tooltip = d3.select("#graph")     
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let x = d3.scaleLinear()
    .range([0, graph_width - margin.left - margin.right]);

let y = d3.scaleLinear()
    .range([graph_height - margin.top - margin.bottom, 0]);

let x_axis_label = svg.append("g");
let y_axis_label = svg.append("g");


let x_axis_text = svg.append("text")
    .attr("transform", `translate(${(graph_width - margin.right - margin.left) / 2}, ${graph_height - margin.bottom - 3})`)  
    .style("text-anchor", "middle")

let y_axis_text = svg.append("text")
    .attr("transform", `translate(${-100}, ${(graph_height - margin.top - margin.bottom) / 2})`)       
    .style("text-anchor", "middle");

let experimentData = undefined;
let inputValue = "Polymer 1";
let outputValue = "Viscosity";


d3.json("../data/Uncountable Front End Dataset.json").then(function(data) {
    experimentData = d3.entries(data);
    setGraphData("Polymer 1", "Viscosity")
    inputDropDown()
    outputDropDown()
});

function setInputData(val) {
    inputValue = val;
    svg.selectAll("circle").remove()
    setGraphData()
}

function setOutputData(val) {
    outputValue = val
    svg.selectAll("circle").remove()
    setGraphData()
}

function inputDropDown() {
    let select = document.getElementById("inputDropdown")
    
    Object.keys(experimentData[0].value.inputs).forEach((input) => {
        let option = document.createElement("option")
        option.value = input
        option.text = input
        select.appendChild(option)

    });
    select.onchange = () => setInputData(select.value)

}

function outputDropDown() {
    let select = document.getElementById("outputDropdown")
    Object.keys(experimentData[0].value.outputs).forEach((output) => {
        let option = document.createElement("option")
        option.value = output
        option.text = output
        select.appendChild(option)
    });
    select.onchange = () => setOutputData(select.value)

}

function setGraphData() {
    
    x.domain([0.00, d3.max(experimentData, function(d) { return d.value.inputs[inputValue]})]).nice();
    x_axis_label
        .attr("transform", `translate(0, ${graph_height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(6).tickFormat(d3.format(".2f")));

    y.domain([0, d3.max(experimentData, function(d) { return d.value.outputs[outputValue]; })]).nice();
    y_axis_label.call(d3.axisLeft(y));
    
    let groups = experimentData.map(function(d) { return d.key});
    let color = d3.scaleOrdinal()
        .domain(groups)
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#ff5c7a"), groups.length));

    let mouseover = function(d) {
        let color_span = `<span style="color: ${color(d.key)};">`;
        let html = `${d.key}<br/>
                ${inputValue}: ${color_span}${d.value.inputs[inputValue]}</span><br/>
                ${outputValue}: ${color_span}${d.value.outputs[outputValue]}</span>`;      

        tooltip.html(html)
            .style("left", `${(d3.event.pageX)}px`)
            .style("top", `${(d3.event.pageY)}px`)
            .style("box-shadow", `2px 2px 5px ${color(d.key)}`)    
            .transition()
            .duration(200)
            .style("opacity", 0.9)
    };

    let mouseout = function(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    };
    
    let dots = svg.selectAll("dot").data(experimentData).enter().append("circle");

    dots.transition()
        .duration(600)
        .attr("cx", function (d) { return x(d.value.inputs[inputValue]); })      
        .attr("cy", function (d) { return y(d.value.outputs[outputValue]); })      
        .attr("r", 4)       
        .style("fill",  function(d){ return color(d.key); });
    
    dots
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    y_axis_text.text(outputValue)
    x_axis_text.text(inputValue)

    dots.exit().remove();
 
}
