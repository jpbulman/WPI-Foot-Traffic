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
                    d3.selectAll("[id='" + buildings_info[building][0] + "']")
                        .style("fill", myColor(buildings_info[building][1][i][1]))
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
            } else if (destinationName === "Other or not listed" || destinationName === "Faraday" || destinationName === "Fountain") {
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
                const timeKey = getTimeKeyFromIndex(i)
                previousI = i
                const timeFormatted = `${timeKey.substring(0, 4)}`
                document.getElementById("currentTimeText").innerHTML = `Current Time: ${timeFormatted}`

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
                    .style("fill", "lime")
                    .style("opacity", ".75")
                    .style("stroke", "black")
                    .on("mouseover", function () {
                        this.style.cursor = "pointer"
                    })
                    .on("click", function () {
                        const currentFill = this.style.fill
                        if (currentFill === "lime")
                            this.style.fill = "red"
                        else
                            this.style.fill = "lime"
                    })
            }
        }

        const duration = 24000;
        let i = 0;
        timer = d3.timer((elapsed) => {
            // I think this should be 11?
            i = Math.floor(elapsed * 11 / duration)
            updateTheMap(buildings_info, i)
            updateDots(i)
            if (elapsed > duration) {
                timer.stop();
            }
        });


    })
})