function barTime(){
d3.selectAll("svg > *").remove()

var width = 700;
var height = 700;
var data = d3.range(10).map(function() {
	return Math.random();
})
var datay = d3.range(10).map(function() {
	return Math.random();
})

 

var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([height, 0]);

var placement = -50;

var svg = d3.select("svg")
    .attr("width",width)
    .attr("height", height)
  .append("g")


var s = select()
var sel =  svg.selectAll(".bar")
      .data(data)
    .enter()

 sel.append("rect")
      .attr("class", "bar")
      .attr("x",0)
      .attr("width", d => width * d)
      .attr("y", function(d, i){ return i * 50;})
      .attr("height", 50)
      .style("fill", "white")
      .style("stroke-width", "5px")
      .style("stroke", "black")

 sel.append("circle")
        .attr("cx", d => width * d /2)
        .attr("cy", (d , i) => i * 50 + 25)
        .attr("r", 10)
        .attr("fill", function(d,i){if(i == s[0] || i == s[1]){ return "black";} else { return "none";}})

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
 
function select(){
	var selection = Math.floor(Math.random() * 10)
	var selection2 = Math.floor(Math.random() * 10)
	while(selection === selection2){
		selection2 = Math.floor(Math.random() * 10)
	}
	return [selection, selection2]
}	
      
  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));
if( data[s[0]] < data[s[1]]){
return [data[s[0]] / data[s[1]], "bar"]
} else {
return [data[s[1]] / data[s[0]], "bar"]
}}
barTime();
