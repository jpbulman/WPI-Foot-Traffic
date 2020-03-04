function bubbleTime() {
    const width = 700
    const height = 700

    const margin = { top: 50, right: 50, bottom: 50, left: 50 }

    const xMin = 0
    const xMax = 10
    const yMin = 0
    const yMax = 10

    let svg = d3.select("svg")

    svg.attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll("*").remove();

    const xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width])

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0])

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    const numberOfBubbles = 10
    const xVals = d3.range(numberOfBubbles).map(d3.randomUniform(xMin, xMax))
    const yVals = d3.range(numberOfBubbles).map(d3.randomUniform(yMin, yMax))
    const sizeVals = d3.range(numberOfBubbles).map(d3.randomUniform(0, 30))

    const data = []
    for (let i = 0; i < xVals.length; i++) {
        data.push({ x: xVals[i], y: yVals[i], size: sizeVals[i] })
    }

    var s = svg.selectAll(".dataPoints")
        .data(data)
        .enter()
    var sel = select(numberOfBubbles);

    s.append("circle")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", (d) => 10 + d.size)
        .style("stroke", "black")
        .style("fill", "white")

    s.append("circle")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .style("fill", function (d, i) { if (i == sel[1] || i == sel[0]) { return "black"; } else { return "white" } })
        .attr("r", 3);
    const val1 = data[sel[0]].size + 10
    const val2 = data[sel[1]].size + 10
    if (val1 < val2) {
        return [val1 / val2, "bubble"]
    }
    else {
        return [val2 / val1, "bubble"]
    }
}

function select(numberOfBubbles) {
    var selection = Math.floor(Math.random() * numberOfBubbles)
    var selection2 = Math.floor(Math.random() * numberOfBubbles)
    while (selection === selection2) {
        selection2 = Math.floor(Math.random() * numberOfBubbles)
    }
    return [selection, selection2]
}	
