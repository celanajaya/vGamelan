function createEditor(parent, totalHeight, totalWidth) {
    var instrumentName = parent.split("-")[0].slice(1);
    //instrumental part
    var part;
    //number of keys/pots, used as y value
    var rangeHeight;
    //total length of pattern, used as x value
    var partLength;
    //how often to show an emphasized beat (aka length of individual sub-patterns)
    var emphasis;

    var svg = d3.select(parent).append('svg').attr('height', totalHeight).attr('width', totalWidth);
    svg.attr("id", instrumentName + "-svg");

    //configure dimensions based on pattern/instrument properties
    switch (instrumentName) {
        case "jegogan":
            part = jegogan;
            rangeHeight = jegoganRange.length;
            partLength = jegogan.length;
            emphasis = meter;
            break;
        case "jublag":
            part= pokok;
            rangeHeight = jublagRange.length;
            partLength = pokok.length;
            emphasis = meter;
            break;
        case"penyacah":
            part= neliti;
            rangeHeight = jublagRange.length;
            partLength = neliti.length;
            emphasis = meter;
        case "ugal":
            part = neliti;
            rangeHeight = gangsaRange.length;
            partLength = neliti.length;
            emphasis = meter;
            break;
        case"pemade":
            part = pemade_part.reduce(toConcatedArrays,[]);
            rangeHeight = gangsaRange.length;
            partLength = pokok.length * gangsaPatternLength;
            emphasis = gangsaPatternLength;
            break;
        case"kantilan":
            part = kantilan_part.reduce(toConcatedArrays, []);
            partLength = pokok.length * gangsaPatternLength;
            emphasis = gangsaPatternLength;
            rangeHeight = gangsaRange.length;
            break;
        case"reyong":
            part = reyong_part.reduce(toConcatedArrays, []);
            rangeHeight = 12;
            partLength = pokok.length * reyongPatternLength;
            emphasis = reyongPatternLength;
            break;
    }

    //make basic grid of svg rects
    for (var y = 0; y < rangeHeight; y++) {
        for (var x = 0; x < partLength; x++) {
            var squareWidth = totalWidth / partLength;
            var squareHeight = totalHeight / rangeHeight;
            //every 4th or 8th column is a little darker
            var boxColor = x % meter === meter - 1 ? 'rgb(200, 200, 200)':'rgb(220, 220, 220)';
            svg.append('rect')
                .attr('width', squareWidth)
                .attr('height', squareHeight)
                .attr('fill', boxColor)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.05)
                .attr('x',squareWidth * x)
                .attr('y', squareHeight * y)
                .attr('id', instrumentName + "-" + y.toString() + "-" + x.toString())
        }
    }
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

function clearAllForInstrument(instrumentName){
    d3.select("#" + instrumentName + "-svg").selectAll("rect").attr('fill', "rgb(220, 220, 220)");
}

function toConcatedArrays(a,b) {return a.concat(b)}




