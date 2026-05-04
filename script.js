// #region SETUP
d3.select("body")
    .append("div")
    .attr("id", "air-map")
        .style("display", "grid")
        .style("max-width", "666px")
        .style("margin-left", "auto")
        .style("margin-right", "auto")
        .style("font-family", "'Source Serif 4', sans-serif");

d3.select("#air-map")
    .append("h1")
    .text("Active Registration Rate in 2024")
    .style("text-align", "center")
    .style("font-family", "'Source Serif 4', sans-serif")
    .style("margin-bottom", 0);

d3.select("#air-map")
    .append("p")
    .text("Difference from 50-state and DC average of 85%")
    .style("text-align", "center")
    .style("font-size", "20px")
    .style("font-family", "'Source Serif 4', sans-serif")
    .style("margin-top", "5px");

var bodyWidth = document.getElementsByTagName("body")[0].getBoundingClientRect().width;

var svg = d3.select("#air-map")
  .append("svg")
  .attr("width", "100%")
  .attr("viewBox", "0 0 666 650");

var airViz = svg.append("g")
    .attr("id", "air-viz")

// #endregion

// #region TOOLTIP

var tooltip = d3.select("#air-map")
    .append("div")
    .attr("id", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background-color", "#ffffff")
        .style("font-color", "black")
        .style("box-shadow", "3px 3px 5px rgba(0, 0, 0, 0.3)")
        .style("display", "flex")
        .style("flex-direction", "column");

var tooltipContent = tooltip.append("div")
    .attr("id", "tooltip-content")
    .style("padding", "0px 20px 0px 20px");

var tooltipText = tooltipContent.append("p")
    .style("text-align", "center");


// #endregion

Promise.all([
    d3.json("data/tile_map.json"),
    d3.csv("data/air_data.csv")
]).then(function([tileMap, airData]) {
    var colorScale = d3.scaleLinear()
        .domain([-0.3, 0, 0.3])
        .range(["#08a36a", "#fff", "#d1218f"]);

    // merging data 
    for (var i = 0; i < tileMap.states.length; i++) {
        var tileState = tileMap.states[i].name;
        for (var j = 0; j < airData.length; j++) {
            var airState = airData[j].State;

            if (tileState == airState) {
                tileMap.states[i].diff = airData[j].category;
                tileMap.states[i].active = airData[j].active;
            }
        };
    };

    // #region MAP SETUP
    var mapContainer = airViz.append("g")
        .attr("id", "map-container")

    // scale variable
    var mapSize = 8;

    var map = mapContainer.append("g")
        .attr("id", "map")
        .selectAll("rect")
        .data(tileMap.states)
        .enter()
        .append("rect")
            .attr("x", d => d.x * mapSize)
            .attr("y", d => d.y * mapSize)
            .attr("width", 5 * mapSize)
            .attr("height", 5 * mapSize)
            .attr("fill", function(d) {
                if (d.diff == "NA") {
                    return "#aaaaaa";
                } else {
                    return colorScale(d.diff);
                }
            })
            .style("stroke", "#000000");

    // state abbreviations for tiles
    mapContainer.append("g")
        .attr("id", "map-abb")
        .selectAll("text")
        .data(tileMap.states)
        .enter()
        .append("text")
            .text(d => d.abb)
            .attr("x", d => d.x * mapSize + 19)
            .attr("y", d => d.y * mapSize + 25)
            .attr("fill", "black")
            .attr("font-size", "14px")
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("pointer-events", "none");

    // centering map
    var mapWidth = mapContainer.node().getBoundingClientRect().width;
    var mapx = mapContainer.node().getBoundingClientRect().x;
    mapContainer.attr("transform", "translate(" + ((666-mapWidth) / 2 - (mapx-((bodyWidth-666)/2))) + ", 0)");

    // #region LEGEND
    var legendData = [
        {text: "-30", value: -0.3},
        {text: "-25", value: -0.25},
        {text: "-20", value: -0.2},
        {text: "-15", value: -0.15},
        {text: "-10", value: -0.1},
        {text: "-5", value: -0.05},
        {text: "0", value: 0},
        {text: "+5", value: 0.05},
        {text: "+10", value: 0.1},
        {text: "+15", value: 0.15},
        {text: "+20", value: 0.2},
        {text: "+25", value: 0.25},
        {text: "+30", value: 0.3}
    ];

    var legend = airViz.append("g")
        .attr("id", "legend");

    var legendBar = legend.append("g")
        .attr("id", "legend-bar")

    legendBar.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => 30 + (i * 40))
        .attr("y", 545)
        .attr("width", 40)
        .attr("height", 20)
        .style("fill", d => colorScale(d.value));

    legendBar.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .text(d => d.text)
        .attr("y", 580)
        .attr("x", function(d, i) {
            if (d.value < 0) {
                return 25 + (i * 40);
            } else if (d.value == 0) {
                return 45 + (i * 40);
            } else if (d.value > 0) {
                return 60 + (i * 40);
            }
        })
        .attr("font-size", "12px");

    var legWidth = legendBar.node().getBoundingClientRect().width;
    var legx = legendBar.node().getBoundingClientRect().x;
    legendBar.attr("transform", "translate(" + ((666-legWidth) / 2 - (legx-((bodyWidth-666)/2))) + ", 0)");

    var legendHeader = legend.append("g")
        .attr("id", "legendHeader");

    legendHeader
        .append("text")
        .text("Difference (Percentage Points)")
        .attr("y", 530)
        .attr("x", 0);

    var headWidth = legendHeader.node().getBoundingClientRect().width;
    var headx = legendHeader.node().getBoundingClientRect().x;
    legendHeader.attr("transform", "translate(" + ((666-headWidth) / 2 - (headx-((bodyWidth-666)/2))) + ", 0)");

    legend
        .append("text")
        .text("*North Dakota does not require formal voter registration.")
        .attr("x", 25)
        .attr("y", 625)
        .style("font-size", "11px");

    legend.append("svg:image")
        .attr("xlink:href", "images/CEIR_Logo_Vertical_OneColor_LightBlue.png")
        .attr("x", 666-50)
        .attr("y", 575)
        .attr("width", 50)
        .attr("height", 50);

    // #endregion

    // #region TOOLTIP FUNCTIONS
    var showTooltip = function(e, d) {
        tooltip
            .style("left", (e.pageX - 70) + "px")
            .style("top", (e.pageY - 60) + "px")
            .style("opacity", 1);

        tooltipText.html(d.name + ": " + d.active);
    };

    var hideTooltip = function(e, d) {
        tooltip.transition()
            .duration(100)
            .style("opacity", 0);
    };

    map
        .on("mouseover", showTooltip)
        .on("mousemove", showTooltip)
        .on("mouseleave", hideTooltip);

    // #endregion

});


    