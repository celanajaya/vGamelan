function createEditor(parent, totalHeight, totalWidth) {
    var instrumentName = parent.split("-")[0].slice(1);
    //instrumental part
    var part = Instrument.parts[instrumentName];
    //number of keys/pots, used as y value
    var rangeHeight = Instrument.range[instrumentName].length;
    //total length of pattern, used as x value
    var partLength = Instrument.getPartLength[instrumentName]();

    var svg = d3.select(parent).append('svg').attr('height', totalHeight).attr('width', totalWidth);
    svg.attr("id", instrumentName + "-svg");

    //configure dimensions based on pattern/instrument properties
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
            svg.append('rect')
                .attr('width', squareWidth)
                .attr('height', squareHeight)
                .attr('fill', 'rgb(220, 220, 220)')
                .attr('stroke', 'black')
                .attr('stroke-width', 0.05)
                .attr('x',squareWidth * x)
                .attr('y', squareHeight * y)
                .attr('id', instrumentName + "-" + y.toString() + "-" + x.toString())
        }
    }
    console.log(instrumentName, part);
    showPattern(instrumentName, part, rangeHeight, partLength);
    return svg;
}

//takes a string for the instrument name, a flattened (polos and sangsih, etc...) array of buffers, the total range of the instrument, and the
//actual length of the part
function showPattern(instrumentName, part, rangeHeight, partLength) {
    clearAllForInstrument(instrumentName);
    part.forEach(function (buffer, index) {
        // var color = index > partLength ? "rgb(0,255,127)" : "rgb(232, 113, 228)"
        if (buffer === "-") return;
        var id = instrumentName + "-" + (rangeHeight - buffer).toString() + "-" + (index % partLength).toString();
        d3.select("#" + id)
            .attr('fill', "rgb(232, 113, 228)");
    });
}

function updateAllSvgs() {
    var allInstruments = Instrument.config.map(function(item) {return item[0]});

    allInstruments.forEach(function(instrumentName){
        var part = Instrument.parts[instrumentName];
        var rangeHeight = Instrument.range[instrumentName].length;
        var partLength = Instrument.getPartLength[instrumentName]();

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
    var rangeHeight = Instrument.range[instrumentName].length;
    var partLength = Instrument.getPartLength[instrumentName]();
    for (var y = 0; y < rangeHeight; y++) {
        for (var x = 0; x < partLength; x++) {
            var boxColor = x % meter === meter - 1 ? 'rgb(200, 200, 200)':'rgb(220, 220, 220)';
            d3.select("#" + instrumentName + "-svg")
                .select(instrumentName + "-" + y.toString() + "-" + x.toString())
                .attr('fill',boxColor);
        }
    }
}

function toConcatedArrays(a,b) {return a.concat(b)}




