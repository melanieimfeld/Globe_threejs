
//ar country = "Germany";
//render(country);

//window.addEventListener('resize', render(country));



function renderChart(country) {

d3.selectAll("svg > *").remove();

console.log("chart function received the following country", country); 
var margin = {top: 10, right: 30, bottom: 30, left: 65};

var clientWidth = document.getElementById('chartwrapper').offsetWidth,
	clientHeight = document.getElementById('chartwrapper').offsetHeight,
	fixedHeight = 370;

//inner dimensions of chart area
var svgWidth = clientWidth -margin.left-margin.right, 
	svgHeight = fixedHeight - margin.top - margin.bottom;

var totals = [{'name': 'Austria', 'value': 0.1},
 {'name': 'UAE', 'value': 0.1},
 {'name': 'Finland', 'value': 0.1},
 {'name': 'Spain', 'value': 0.3},
 {'name': 'Korea', 'value': 0.4},
 {'name': 'Norway', 'value': 0.5},
 {'name': 'Australia', 'value': 0.7},
 {'name': 'Switzerland', 'value': 0.8},
 {'name': 'Denmark', 'value': 0.9},
 {'name': 'Belgium', 'value': 0.9},
 {'name': 'Kuwait', 'value': 1.2},
 {'name': 'Saudi Arabia', 'value': 1.6},
 {'name': 'Italy', 'value': 2.3},
 {'name': 'Sweden', 'value': 2.5},
 {'name': 'Canada', 'value': 3.5},
 {'name': 'Netherlands', 'value': 3.7},
 {'name': 'France', 'value': 6.3},
 {'name': 'United Kingdom', 'value': 14.8},
 {'name': 'Germany', 'value': 30.1},
 {'name': 'Japan', 'value': 90.6},
 {'name': 'United States', 'value': 91.3}];


var max = d3.max(totals);
console.log("testdata", max);

var barWidth = (svgWidth / totals.length);
var barPadding = 5; 

var xScale = d3.scaleLinear()
	.range([0,svgWidth])
	.domain([0,91.3]);

var yScale = d3.scaleBand()
	.range([ 0, svgHeight])
  	.domain(totals.map(function(d) { return d.name; }));

 // var tooltip = d3.select("#chart")
	// .append("div")
	// .style("position", "absolute")
	// .style("z-index", "10")
	// .style("visibility", "hidden")
	// .text("a simple tooltip");
  	

var svg = d3.select('#chart')  
    .attr("width", svgWidth+ margin.left + margin.right)  
    .attr("height", svgHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//chart title
svg.append("text")            
        .attr("y", fixedHeight - (margin.bottom)) 
        .style("font-size", "13px") 
        .text("Total flows per donor country in $m");

 svg.append("g")
	.attr("transform", "translate(-5,-10)")
	.attr("class", "y axis")
	.call(d3.axisLeft(yScale).tickSize(0))
	.selectAll("text")
	.attr("transform", "rotate(-40)");
 // 	.range([])
 // 	.domain([])

var barChart = svg.selectAll("myline")
	.data(totals)
	.enter()
	.append("line")
	.attr("y1", function(d) { return yScale(d.name); })
    .attr("y2", function(d) { return yScale(d.name); })
    .transition()
	.duration(1000)
    .attr("x1", xScale(0))
    .attr("x2", function(d) { return xScale(d.value); })
    .style("stroke", function(d ){return (d.name.toLowerCase() == country ? "white" :"red"); });

console.log("country", country);

//makes a g element at each circle position
var g = svg.selectAll(null)
        .data(totals)
        .enter()
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + xScale(d.value)+","+yScale(d.name)  + ")" ;
        });


  	g.append("circle")
  	// .attr("cy", function(d) { return yScale(d.name); })
  	 .transition()
	.duration(1000)
  	// .attr("cx", function(d) { return xScale(d.value); })
  	.attr("r", 4)
  	.style("fill", function(d ){return (d.name.toLowerCase() == country ? "white" :"red"); });


  	 g.append("text")
  	 .attr("font-size", "9px")
  	 .attr("dx", 5)
	// .attr("x", function(d) { return xScale(0); })
	// .attr("y", function(d) { return yScale(d.name); })

	.text(function(d){return d.value;});

// var circ = svg.selectAll("myCircle")
// 	.data(totals)
// 	.enter()
//   	.append("circle")
//   	.attr("cy", function(d) { return yScale(d.name); })
//   	 .transition()
// 	.duration(1000)
//   	.attr("cx", function(d) { return xScale(d.value); })
//   	.attr("r", 4)
//   	.style("fill", function(d ){return (d.name.toLowerCase() == country ? "white" :"red"); });
  	
//   	g.selectAll("text")
// 	.data(totals)
// 	.enter() 
//   	.append("text")
// 	.attr("x", function(d) { return xScale(0); })
// 	.attr("y", function(d) { return yScale(d.name); })
// 	.text(function(d){return "$"+ d.value + " m";});
  	// .on("mouseover", handleMouseover);
  	 


function handleMouseover(d) {
	console.log(d.value, this.cy);
	d3.select(this).append("text")
		.attr("x", function(d) { return 10; })
		.attr("y", function(d) { return 10; })
		.attr("z-index", 100)
		.attr("font-size", "10px")
		.text(function(d){return d.value;});
}


// d3.selectAll("myCircle", "myline").on("mouseover", function(d){
//  console.log("test");

// });

}

  


