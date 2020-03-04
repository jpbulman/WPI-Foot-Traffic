function pieBubbleChart() {
    const width = 700
    const height = 700

    const margin = { top: 50, right: 50, bottom: 50, left: 50 }

    const xMin = 0
    const xMax = 10
    const yMin = 0
    const yMax = 10

    d3.select(".chart").select("svg").remove()
    let svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    const numberOfBubbles = 2
    const numberOfPiecesInPie = 5

    let xVals = d3.range(numberOfBubbles).map(d3.randomUniform(xMin, xMax))
    let yVals = d3.range(numberOfBubbles).map(d3.randomUniform(yMin, yMax))
    let sizeVals = d3.range(numberOfBubbles).map(d3.randomUniform(20, 70))

    //Check if the circle are overlapping
    for (let i = 0; i < numberOfBubbles; i++) {
        const maxXCircleA = xVals[i] + sizeVals[i]
        const minXCircleA = xVals[i] - sizeVals[i]
        const maxYCircleA = yVals[i] + sizeVals[i]
        const minYCircleA = yVals[i] - sizeVals[i]

        for (let j = i + 1; j < numberOfBubbles; j++) {
            const maxXCircleB = xVals[j] + sizeVals[j]
            const minXCircleB = xVals[j] - sizeVals[j]
            const maxYCircleB = yVals[j] + sizeVals[j]
            const minYCircleB = yVals[j] - sizeVals[j]

            const xsInSameRange = (maxXCircleB < maxXCircleA && maxXCircleB > minXCircleA) || (minXCircleB < maxXCircleA && minXCircleB > minXCircleA)
            const ysInSameRange = (maxYCircleB < maxYCircleA && maxYCircleB > minYCircleA) || (minYCircleB < maxYCircleA && minYCircleB > minYCircleA)
            if (xsInSameRange && ysInSameRange) {
                xVals = d3.range(numberOfBubbles).map(d3.randomUniform(xMin, xMax))
                yVals = d3.range(numberOfBubbles).map(d3.randomUniform(yMin, yMax))
                sizeVals = d3.range(numberOfBubbles).map(d3.randomUniform(20, 70))
            }
        }
    }

    const percentagesWithinPieChart = []
    for (let i = 0; i < xVals.length; i++) {
        let randPercentDatage = d3.range(numberOfPiecesInPie).map(d3.randomUniform(0, 10))
        let sum = randPercentDatage.reduce((a, b) => a + b)
        for (let j = 0; j < randPercentDatage.length; j++) {
            let ratio = randPercentDatage[j] / sum
            if (ratio < .1) {
                randPercentDatage = d3.range(numberOfPiecesInPie).map(d3.randomUniform(0, 10))
                sum = randPercentDatage.reduce((a, b) => a + b)
                j = -1
            }
        }
        percentagesWithinPieChart.push(randPercentDatage)
    }

    const pie = d3.pie()

    const randCircleIndexOne = Math.floor((Math.random() * numberOfBubbles) + 0)
    let randCircleIndexTwo = Math.floor((Math.random() * numberOfBubbles) + 0)
    while (randCircleIndexTwo === randCircleIndexOne) {
        randCircleIndexTwo = Math.floor((Math.random() * numberOfBubbles) + 0)
    }

    let proportionSizes = []

    for (let i = 0; i < percentagesWithinPieChart.length; i++) {
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(sizeVals[i])

        const arcs = svg.selectAll("arc")
            .data(pie(percentagesWithinPieChart[i]))
            .enter()
            .append("g")
            .attr("transform", "translate(" + xScale(xVals[i]) + "," + yScale(yVals[i]) + ")")

        arcs.append("path")
            .attr("fill", "white")
            .style("stroke", "black")
            .attr("d", arc);

        // The most garbage code I have ever written -- by a decent margin
        if (i === randCircleIndexOne || i === randCircleIndexTwo) {
            let xShift = -999999
            let yShift = -999999

            const randPortionOfRandCircleToBeMarked = Math.floor((Math.random() * numberOfPiecesInPie) + 0)
            const sumOfPieces = percentagesWithinPieChart[i].reduce((a, b) => a + b)
            let percentagesOfPieChart = []
            for (let j = 0; j < percentagesWithinPieChart[i].length; j++) {
                percentagesOfPieChart.push(percentagesWithinPieChart[i][j] / sumOfPieces)
            }
            const selectedPercentage = percentagesOfPieChart[randPortionOfRandCircleToBeMarked]

            const areaOfEntireCircle = Math.pow(Math.PI * sizeVals[i], 2)
            const areaOfPortionOfCircle = selectedPercentage * areaOfEntireCircle
            proportionSizes.push(areaOfPortionOfCircle)

            percentagesOfPieChart.sort().reverse()
            let acc = 0
            for (let j = 0; j < percentagesOfPieChart.length; j++) {
                if (percentagesOfPieChart[j] === selectedPercentage) {
                    const numberOfDegrees = (acc + (selectedPercentage * 360 / 2)) + 90
                    xShift = Math.cos(numberOfDegrees * (Math.PI / 180)) * sizeVals[i]
                    yShift = Math.sin(numberOfDegrees * (Math.PI / 180)) * sizeVals[i]
                }

                acc += percentagesOfPieChart[j] * 360
            }

            svg.append("circle")
                .attr("cx", xScale(xVals[i]) - (xShift / 1.5))
                .attr("cy", yScale(yVals[i]) - (yShift / 1.5))
                .attr("r", sizeVals[i] / 10)
                .attr("fill", "black")
        }
    }

    if (proportionSizes[0] < proportionSizes[1]) {
        return [(proportionSizes[0] / proportionSizes[1]), "piebubble"]
    } else {
        return [(proportionSizes[1] / proportionSizes[0]), "piebubble"]
    }
}
pieBubbleChart()
