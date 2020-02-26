d3.csv("responses.csv").then((data) => {
    let locationAndTimeMap = {}
    for (let i = 0; i < data.length; i++) {
        const currentResponse = data[i]
        for (key in currentResponse) {
            if (key.includes("Other") || key === "Timestamp") {
                continue
            }

            const currentBuilding = currentResponse[key]
            if (currentBuilding in locationAndTimeMap) {
                if (key in locationAndTimeMap[currentBuilding]) {
                    locationAndTimeMap[currentBuilding][key] = locationAndTimeMap[currentBuilding][key] + 1
                } else {
                    locationAndTimeMap[currentBuilding][key] = 1
                }
            } else {
                const toMake = {}
                toMake[key] = 1
                locationAndTimeMap[currentBuilding] = toMake
            }
        }
    }
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = 450 - margin.left - margin.right,
        height = 712.5 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Labels of row and columns
    let times = Object.keys(data[0])
    times = times.filter((a) => a !== "Timestamp" && !a.includes("Other"))
    times.forEach((d, i) => {
        let formattedString = d.replace("?", "")
        formattedString = formattedString.split("to")[0]
        if (i === 0) {
            formattedString = "8am"
        }
        times[i] = formattedString
    })
    const locations = Object.keys(locationAndTimeMap)

    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([0, width])
        .domain(times)
        .padding(0.01);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
    svg.selectAll("text")
        .attr("transform", "rotate(-90)")
        .attr("dx", "-2em")
        .attr("dy", "-.5em")

    // Build X scales and axis:
    var y = d3.scaleBand()
        .range([height, 0])
        .domain(locations)
        .padding(0.01);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Build color scale
    var myColor = d3.scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([1, 100])

    // svg.selectAll()
    // .data(locationAndTimeMap)
    // .enter()
    // .
})

//Read the data
// d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv").then(function (data) {
//     svg.selectAll()
//         .data(data, function (d) { return d.group + ':' + d.variable; })
//         .enter()
//         .append("rect")
//         .attr("x", function (d) { return x(d.group) })
//         .attr("y", function (d) { return y(d.variable) })
//         .attr("width", x.bandwidth())
//         .attr("height", y.bandwidth())
//         .style("fill", function (d) { return myColor(d.value) })
// })