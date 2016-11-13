function createEditor(parent, totalHeight, totalWidth) {
    console.log("create editor, parent", parent);
    var instrumentName = parent.split("-")[0].slice(1);
    console.log(instrumentName);
    //instrumental part
    var part = Gamelan.parts[instrumentName];
    //number of keys/pots, used as y value
    var rangeHeight = Gamelan.range[instrumentName].length;
    //total length of pattern, used as x value
    var partLength = Gamelan.getPartLength[instrumentName]();

    var svg = d3.select(parent).append('svg').attr('height', totalHeight).attr('width', totalWidth);
    svg.attr("id", instrumentName + "-svg");
    //configure dimensions based on pattern/instrument properties
    var meter = Gamelan.meter;
    switch (instrumentName) {
        case"pemade":
        case"kantilan":
        case"reyong":
            part = part.reduce(toConcatedArrays, []);
            break;
    }

    //make basic grid of svg rects
    for (var y = 0; y < rangeHeight; y++) {
        for (var x = 0; x < partLength; x++) {
            var squareWidth = totalWidth / partLength;
            var squareHeight = totalHeight / rangeHeight;
            var boxColor = x % Gamelan.meter === Gamelan.meter - 1 ? 'rgb(200, 200, 200)':'rgb(220, 220, 220)';
            svg.append('rect')
                .attr('width', squareWidth)
                .attr('height', squareHeight)
                .attr('fill', boxColor)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.05)
                .attr('x',squareWidth * x)
                .attr('y', squareHeight * y)
                .on('click', rectClick)
                .attr('id', instrumentName + "-" + y.toString() + "-" + x.toString())
        }
    }
    showPattern(instrumentName, part, rangeHeight, partLength);
    return svg;
}

//actual length of the part
function showPattern(instrumentName, part, rangeHeight, partLength) {
    clearAllForInstrument(instrumentName);
    part.forEach(function (buffer, index) {
        if (buffer === "-") return;
        var id = instrumentName + "-" + ((rangeHeight - 1) - buffer).toString() + "-" + (index % partLength).toString();
        d3.select("#" + id).attr('fill', "rgb(232, 113, 228)");
    });
}

function rectClick(){
    var components = this.id.split("-");
    var instrumentName = components[0];
    var buffer = components[1];
    var partIndex = components[2];
    players[instrumentName].start(buffer);
    Gamelan.parts[instrumentName][partIndex] = partIndex;
    d3.select("#"+ this.id).attr('fill', "rgb(232, 113, 228)");
}

function updateAllSvgs() {
    var allInstruments = Gamelan.config.map(function(item) {return item[0]});
    allInstruments.forEach(function(instrumentName){
        var part = Gamelan.parts[instrumentName];
        var rangeHeight = Gamelan.range[instrumentName].length;
        var partLength = Gamelan.getPartLength[instrumentName]();

        switch (instrumentName) {
            case"pemade":
            case"kantilan":
            case"reyong":
                part = part.reduce(toConcatedArrays, []);
                break;
        }

        showPattern(instrumentName, part, rangeHeight, partLength);
    });
}

function clearAllForInstrument(instrumentName){
    var range = Gamelan.range[instrumentName].length;
    var part = Gamelan.getPartLength[instrumentName]();
    for (var y = 0; y < range; y++) {
        for (var x = 0; x < part; x++) {
            var boxColor = x % Gamelan.meter === Gamelan.meter - 1 ? 'rgb(200, 200, 200)':'rgb(220, 220, 220)';
            var i_Selector = "#" + instrumentName;
            d3.select(i_Selector + "-svg")
                .select(i_Selector + "-" + y.toString() + "-" + x.toString())
                .attr('fill',boxColor);
        }
    }
}

function toConcatedArrays(a,b) {return a.concat(b)}




