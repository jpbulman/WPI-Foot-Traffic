var width = 960,
    height = 750;

var projection = d3.geoMercator()
    .scale(4000000)
    .translate([width / 2, height / 2])

var svg = d3.select("body").select("#svgContainer").append("svg")
    .attr("width", width)
    .attr("height", height)

const toolTipDiv = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

let keepHeatMapOn = true

document.getElementById('overlayPeople').checked = true
document.getElementById('overlayPeople').onclick = function () {
    svg.selectAll(".studentDots")
        .style("opacity", this.checked ? .75 : 0)
}

document.getElementById("colorPicker").value = "#00FF00"

document.getElementById('overlayHeat').checked = true
document.getElementById('overlayHeat').onclick = function () {
    keepHeatMapOn = !keepHeatMapOn
}

document.getElementById("colorPicker").addEventListener("change", function () {
    svg.selectAll(".studentDots")
        .style("fill", event.target.value)
}, false)

let g = d3.json("map.geojson", function (error, NYC_MapInfo) {
    // after loading geojson, use d3.geo.centroid to find out 
    // where you need to center your map
    var center = d3.geo.centroid(NYC_MapInfo);
    projection.center(center);

    // now you can create new path function with 
    // correctly centered projection
    var path = d3.geo.path().projection(projection);

    // and finally draw the actual polygons
    svg.selectAll("path")
        .data(NYC_MapInfo.features)
        .enter()
        .append("path")
        .attr("d", path);
});
g.then(function (result) {
    var center = d3.geoCentroid(result);
    console.log(center)
    projection.center(center);

    // now you can create new path function with 
    // correctly centered projection
    var path = d3.geoPath().projection(projection);

    // and finally draw the actual polygons
    svg.selectAll("path")
        .data(result.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function (d) { return d.properties['name']; })
        .style("fill", function (d) { if (d.properties['name'] === 'Worcester Polytechnic Institute') { return "none"; } else { return "#00001f4f"; } })
        .style("stroke", function (d) { if (d.properties['name'] === 'Worcester Polytechnic Institute') { return "red"; } else { return "grey"; } })
        .on("mouseover", function () {
            const buildingName = this.id
            if (buildingName !== "") {
                toolTipDiv.transition()
                    .duration(200)
                    .style("opacity", .9)
                toolTipDiv.html(`${buildingName}`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            }
        })
        .on("mouseout", () => {
            toolTipDiv.transition()
                .duration(500)
                .style("opacity", 0)
        })
    d3.csv("output.csv").then((data) => {
        var myColor = d3.scaleLinear()
            .range(["white", "steelblue"])
            .domain([1, 5])
        let times = Object.keys(data[0])
        times = times.filter((a) => a !== "Timestamp" && !a.includes("Other"))
        times.forEach((d, i) => {
            times[i] = d
        })
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

        buildings_info = []
        for (key in locationAndTimeMap) {
            time_quant_pair = []
            for (v in times) {
                if (locationAndTimeMap[key][times[v]] > 0) {
                    time_quant_pair.push([v, locationAndTimeMap[key][times[v]]]);
                } else {
                    time_quant_pair.push([v, 0])
                }
            }
            buildings_info.push([key, time_quant_pair])
        }

        function updateTheMap(buildings_info, i) {
            for (building in buildings_info) {
                try {
                    const color = keepHeatMapOn ? myColor(buildings_info[building][1][i][1]) : "#00001f4f"
                    d3.selectAll("[id='" + buildings_info[building][0] + "']")
                        .style("fill", color)
                } catch {
                }
            }
        }

        function generateRandomXorYForDataTime(destinationName, isX) {
            if (destinationName === "Off campus or at home") {
                destinationName = "West Street Lot"
            } else if (destinationName === "Fuller Apartments") {
                // Close enough
                destinationName = "Schussler Lot"
            } else if (destinationName === "Stoddard Complex") {
                destinationName = "Hackfield Lot"
            } else if (destinationName === "Fountain") {
                const box = d3.select("[id='" + "Higgins Laboratories" + "']").node().getBBox()
                const startingVal = isX ? box.x : box.y
                return startingVal + (isX ? 10 : -10)
            } else if (destinationName === "Faraday") {
                destinationName = "Farady"
            } else if (destinationName === "Other or not listed") {
                return 0
            }
            const box = d3.select("[id='" + destinationName + "']").node().getBBox()
            const startingVal = isX ? box.x : box.y
            let randVal = (Math.random() * box.width) + startingVal
            return randVal
        }

        function getTimeKeyFromIndex(index) {
            const timeKeys = ["Where are you from 8am to 9am on Monday's?", "9am to 10am?", "10am to 11am?", "11am to 12pm?", "12pm to 1pm?", "1pm to 2pm?"
                , "2pm to 3pm?", "3pm to 4pm?", "4pm to 5pm?", "5pm to 6pm?", "6pm to 7pm?", "7pm to 8pm?"]
            return timeKeys[index]
        }

        let previousI = 0
        function updateDots(i) {
            if (i === previousI + 1) {
                previousI = i
                const timeKey = getTimeKeyFromIndex(i)
                d3.selectAll(".studentDots")
                    .transition()
                    .duration(2000)
                    .attr("cx", (d, index) => {
                        const currentLocation = d[getTimeKeyFromIndex(i - 1)]
                        const destinationName = d[timeKey]
                        // Don't move if we're in the same building
                        if (currentLocation !== destinationName) {
                            return generateRandomXorYForDataTime(destinationName, true)
                        } else {
                            return document.getElementById(index).getAttribute("cx")
                        }
                    })
                    .attr("cy", (d, index) => {
                        const currentLocation = d[getTimeKeyFromIndex(i - 1)]
                        const destinationName = d[timeKey]
                        if (currentLocation !== destinationName) {
                            return generateRandomXorYForDataTime(destinationName, false)
                        } else {
                            return document.getElementById(index).getAttribute("cy")
                        }
                    })
            } else if (i === 0) {
                document.getElementById("currentTimeText").innerHTML = "Current Time: 8am"
                //Initial case where we draw the starting dots
                svg.selectAll(".studentDots")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", (d) => {
                        const destinationName = d[getTimeKeyFromIndex(0)]
                        return generateRandomXorYForDataTime(destinationName, true)
                        // const startingY = box.y
                        // let randY = (Math.random() * box.width) + startingY

                        // const str = document.getElementById(locationName).getAttribute("d")
                        // var commands = str.split(/(?=[LMC])/);
                        // var pointArrays = commands.map(function (d) {
                        //     var pointsArray = d.slice(1, d.length).split(',');
                        //     var pairsArray = [];
                        //     for (var i = 0; i < pointsArray.length; i += 2) {
                        //         pairsArray.push([+pointsArray[i], +pointsArray[i + 1]]);
                        //     }
                        //     return pairsArray;
                        // });
                        // console.log(pointArrays)
                        // console.log(d3.polygonContains(d3.polygonHull(pointArrays), [0, 1]))
                        // let i = 0
                        // let pointArr = [randX, randY]
                        // console.log(d3.polygonContains(d3.polygonHull(pointArrays), [712.8, 498]))
                        // while (!d3.polygonContains(pointArrays, pointArr) && i < 100) {
                        //     randX = (Math.random() * box.width) + startingX
                        //     randY = (Math.random() * box.width) + startingY
                        //     console.log(randX, randY, i)
                        //     pointArr = [randX, randY]
                        //     i++
                        // }
                        // return {
                        //     cx: randX,
                        //     cy: randY,
                        //     r: 5,
                        //     id: `p-${locationName}`
                        // }
                    })
                    .attr("cy", (d) => {
                        const destinationName = d[getTimeKeyFromIndex(0)]
                        return generateRandomXorYForDataTime(destinationName, false)
                    })
                    .attr("r", 5)
                    .attr("data-currentLocation", (d) => {
                        return d["1pm to 2pm?"]
                    })
                    .attr("class", "studentDots")
                    .attr("id", (data, index) => index)
                    .style("fill", document.getElementById("colorPicker").value)
                    .style("opacity", ".75")
                    .style("stroke", "black")
                    .on("mouseover", function () {
                        this.style.cursor = "pointer"
                    })
                    .on("click", function () {
                        const currentFill = this.style.fill
                        if (currentFill === "red")
                            this.style.fill = document.getElementById("colorPicker").value
                        else
                            this.style.fill = "red"
                    })
            }
        }
        let last_paused = 0;
        let interruptPlay = false
        function startDrawingMap() {
            document.getElementById("playButton").innerHTML = "&#10074;&#10074;"
            document.getElementById("playButton").onclick = stopDrawingMap
            interruptPlay = false
            const duration = 24000;
            let i = 0;
            timer = d3.timer((elapsed) => {
                // I think this should be 11?
                let paused_value = last_paused + elapsed
                i = Math.floor(paused_value * 11 / duration)
                const timeKey = getTimeKeyFromIndex(i)
                const timeFormatted = `${timeKey.substring(0, 4)}`
                document.getElementById("currentTimeText").innerHTML = `Current Time: ${timeFormatted}`

                updateTheMap(buildings_info, i)
                updateDots(i)
                if (paused_value > duration || interruptPlay) {
                    last_paused = paused_value
                    timer.stop();
                }
            });
        }

        function stopDrawingMap() {
            interruptPlay = true
            document.getElementById("playButton").onclick = startDrawingMap
            document.getElementById("playButton").innerHTML = "&#9658;"
        }

        document.getElementById("playButton").onclick = startDrawingMap
    })
})

/*
 * BEGIN HEATMAP CODE 
 */
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
    const margin = { top: 30, right: 30, bottom: 30, left: 90 },
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
    //Tooltip
    var Tooltip = d3.select("#tooltipHeatmap")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltipHeatmap")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute")
        .style("width", width)
    // Build color scale
    var myColor = d3.scaleLinear()
        .range(["white", "steelblue"])
        .domain([1, 5])


    let heat = d3.entries(locationAndTimeMap)
    let heatmap = [];
    for (h in heat) {
        for (v in heat[h].value) {
            heatmap.push([heat[h].key, v, heat[h].value[v]])
        }
    }
    for (h in heatmap) {
        let formatTime = heatmap[h][1].replace("?", "")
        formatTime = formatTime.split("to")[0]
        if (formatTime[0] === 'W') {
            formatTime = "8am"
        }
        heatmap[h][1] = formatTime;
    }
    svg.selectAll("g")
        .data(heatmap, function (d) { return d; })
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d[1]) })
        .attr("y", function (d) { return y(d[0]) })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => myColor(d[2]))
        .on("mouseover", function (d) {
            var g = d3.select(this);
            g.style("stroke", "black")
            Tooltip
                .classed('info', true)
                .style("opacity", 1)
                .attr('x', 20)
                .attr('y', 500)
                .text(d[2] + (d[2] === 1 ? " Respondant " : " Respondants ") + (d[2] === 1 ? "was " : "were ") + "in " + d[0] + " at " + d[1]);
        })
        .on("mouseout", function () {
            // Remove the info text on mouse out.
            let g = d3.select(this)
            g.style("stroke", "none")
            Tooltip.text("");
            Tooltip.style("opacity", 0)
        })
        .on("mousemove", function (d) {
            Tooltip
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 50) + "px")
        })
})