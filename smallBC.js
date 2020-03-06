d3.csv('output.csv').then((rows) => {
    //For some reason Object.keys screws up the order majorly, and trying to sort these is a b***h, so harcoding it is
    const keys = ["Where are you from 8am to 9am on Monday's?", "9am to 10am?", "10am to 11am?", "11am to 12pm?", "12pm to 1pm?", "1pm to 2pm?"
        , "2pm to 3pm?", "3pm to 4pm?", "4pm to 5pm?", "5pm to 6pm?", "6pm to 7pm?", "7pm to 8pm?"]
    let locationAndTimeMap = {}
    for (let i = 0; i < rows.length; i++) {
        const currentResponse = rows[i]
        for (key in currentResponse) {
            if (key.includes("Other") || key === "Timestamp") {
                continue
            }
            const currentBuilding = currentResponse[key]
            if (currentBuilding in locationAndTimeMap) {
                locationAndTimeMap[currentBuilding][key] = locationAndTimeMap[currentBuilding][key] + 1
            } else {
                const toMake = {}
                for (index in keys) {
                    toMake[keys[index]] = 0
                }
                toMake[key] = 1
                locationAndTimeMap[currentBuilding] = toMake
            }
        }
    }

    function drawBarGraphFromHashMap(hmData, name) {
        const barChartMargin = { top: 20, right: 100, bottom: 70, left: 40 },
            widthOfMajorBarChart = 400 - barChartMargin.left - barChartMargin.right,
            heightOfMajorBarChart = 200 - barChartMargin.top - barChartMargin.bottom;

        const barChartSVG = d3.select("#miniBarChartSVGDiv").append("svg")
            .attr("width", widthOfMajorBarChart + barChartMargin.left + barChartMargin.right)
            .attr("height", heightOfMajorBarChart + barChartMargin.top + barChartMargin.bottom)
            .attr("id", `barGraphSVG-${key}`)

        const barChartXScale = d3.scaleBand()
            .rangeRound([0, widthOfMajorBarChart])
            .padding(0.1);

        const barChartYScale = d3.scaleLinear()
            .rangeRound([heightOfMajorBarChart, 0]);

        d3.select("#barGraphSVG")
            .append("g")
            .attr("transform",
                "translate(" + barChartMargin.left + "," + barChartMargin.top + ")")
        g = barChartSVG.append("g").attr("transform", "translate(" + barChartMargin.left + "," + barChartMargin.top + ")");

        //More really jank stuff
        const formattedKeys = []
        keys.forEach((el, i) => { formattedKeys[i] = el.substring(0, (isNaN(Number(el.charAt(1))) ? 1 : 2)) })
        formattedKeys[0] = "8"

        barChartXScale.domain(formattedKeys)
        barChartYScale.domain([0, 35])

        g.append("g")
            .attr("transform", "translate(0," + heightOfMajorBarChart + ")")
            .call(d3.axisBottom(barChartXScale))
            .append("text")
            .attr("x", 175 + (name.length * 1.5))
            .attr("dy", "3.5em")
            .attr("fill", "#000")
            .attr("text-anchor", "end")
            .text(`Time of day in ${name}`)

        g.append("g")
            .call(d3.axisLeft(barChartYScale))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-3.5em")
            .attr("text-anchor", "end")
            .text("Number of People");

        g.selectAll(".bar")
            .data(keys)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => barChartXScale(formattedKeys[i]))
            .attr("y", (d) => barChartYScale(hmData[d]))
            .attr("width", barChartXScale.bandwidth())
            .attr("height", (d) => { return heightOfMajorBarChart - barChartYScale(hmData[d]) })
            .attr("fill", "steelblue")
    }
    for (key in locationAndTimeMap) {
        drawBarGraphFromHashMap(locationAndTimeMap[key], key)
    }
})