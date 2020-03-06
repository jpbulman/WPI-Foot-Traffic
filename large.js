const barChartMargin = { top: 20, right: 100, bottom: 70, left: 40 },
    widthOfMajorBarChart = 1200 - barChartMargin.left - barChartMargin.right,
    heightOfMajorBarChart = 500 - barChartMargin.top - barChartMargin.bottom;

const barChartSVG = d3.select("#barChartSVGDiv").append("svg")
    .attr("width", widthOfMajorBarChart + barChartMargin.left + barChartMargin.right)
    .attr("height", heightOfMajorBarChart + barChartMargin.top + barChartMargin.bottom)
    .attr("id", "barGraphSVG")

const barChartXScale = d3.scaleBand()
    .rangeRound([0, widthOfMajorBarChart])
    .padding(0.1);

const barChartYScale = d3.scaleLinear()
    .rangeRound([heightOfMajorBarChart, 0]);

d3.csv('output.csv').then((rows) => {
    let timePicker = document.getElementById("timePicker")
    for (key in rows[0]) {
        if (key.includes("Timestamp") || key.includes("Other")) {
            continue
        } else {
            timePicker.options[timePicker.options.length] = new Option(key, key)
        }
    }
    timePicker.onchange = function () {
        drawBarGraphFromKey(this.value)
    }

    function drawBarGraphFromKey(key) {
        d3.select("#barGraphSVG").selectAll("*").remove()
        d3.select("#barGraphSVG")
            .append("g")
            .attr("transform",
                "translate(" + barChartMargin.left + "," + barChartMargin.top + ")")
        g = barChartSVG.append("g").attr("transform", "translate(" + barChartMargin.left + "," + barChartMargin.top + ")");

        let buildingsValueMap = {}
        rows.forEach(currentResponse => {
            const currentBuilding = currentResponse[key]
            if (currentBuilding in buildingsValueMap) {
                buildingsValueMap[currentBuilding] = buildingsValueMap[currentBuilding] + 1
            } else {
                buildingsValueMap[currentBuilding] = 1
            }
        })

        var sortable = [];
        for (var vehicle in buildingsValueMap) {
            sortable.push([vehicle, buildingsValueMap[vehicle]]);
        }

        sortable.sort(function (a, b) {
            return b[1] - a[1];
        });

        sortable = sortable.map(a => a[0])

        barChartXScale.domain(sortable)
        barChartYScale.domain([0, 35])

        g.append("g")
            .attr("transform", "translate(0," + heightOfMajorBarChart + ")")
            .call(d3.axisBottom(barChartXScale)).selectAll("text")
            .attr("transform", "rotate(-10)")
            .attr("dy", "1.5em")

        g.append("g")
            .call(d3.axisLeft(barChartYScale))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-3.5em")
            .attr("text-anchor", "end")
            .text("People");

        g.selectAll(".bar")
            .data(Object.keys(buildingsValueMap))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => barChartXScale(d))
            .attr("y", (d) => barChartYScale(buildingsValueMap[d]))
            .attr("width", barChartXScale.bandwidth())
            .attr("height", (d) => heightOfMajorBarChart - barChartYScale(buildingsValueMap[d]))
            .attr("fill", "steelblue")
    }

    drawBarGraphFromKey(document.getElementById("timePicker").value)
})