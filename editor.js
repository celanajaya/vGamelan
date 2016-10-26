function createEditor(parent, height, width) {
    var instrumentName = parent.split("-")[0].slice(1);
    var part;
    var rangeLength;
    var partLength;
    var meter;

    var svg = d3.select(parent).append('svg').attr('height', height).attr('width', width);

    switch (instrumentName) {
        case "jegogan":
            part = jegogan;
            rangeLength = jegoganRange.length;
            partLength = jegogan.length
            meter = 4;
            break;
        case "jublag":
            part= pokok;
            rangeLength = jublagRange.length;
            partLength = pokok.length;
            meter = 4;
            break;
        case"penyacah":
            part= neliti;
            rangeLength = jublagRange.length;
            partLength = neliti.length;
            meter = 4;
        case "ugal":
            part = neliti;
            rangeLength = gangsaRange.length;
            partLength = neliti.length;
            meter = 4;
            break;
        case"pemade":
            part = pemade_part_buffers.reduce(toConcatedArrays,[]);
            rangeLength = gangsaRange.length;
            partLength = pokok.length * 8;
            meter = 8;
            break;
        case"kantilan":
            part = kantilan_part_buffers.reduce(toConcatedArrays, []);
            partLength = pokok.length * 8;
            rangeLength = gangsaRange.length;
            meter = 8;
            break;
        case"reyong":
            part = reyong_part_buffers.reduce(toConcatedArrays, []);
            rangeLength = 12;
            partLength = pokok.length * 8;
            meter = 8;
            break;
    }
    //make basic grid of svg rects
    for (var col = 0; col < rangeLength; col++) {
        for (var row = 0; row < partLength; row++) {
            var squareWidth = width / partLength;
            var squareHeight = height / rangeLength;
            //every 4th or 8th column is a little darker
            var boxColor = row % meter === meter - 1 ? 'rgb(200, 200, 200)':'rgb(220, 220, 220)';
            svg.append('rect')
                .attr('width', squareWidth)
                .attr('height', squareHeight)
                .attr('fill', boxColor)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.05)
                .attr('x',squareWidth * row)
                .attr('y', squareHeight * col)
                .attr('id', instrumentName + "-" + col.toString() + "-" + row.toString())
        }
    }
    showPattern(instrumentName, part, rangeLength, partLength);
    return svg;
}

//takes a string for the instrument name, a flattened (polos and sangsih, etc...) array of buffers, the total range of the instrument, and the
//actual length of the part
function showPattern(instrumentName, part, rangeLength, partLength) {
    part.forEach(function (buffer, index) {
        var color = index > partLength ? "rgb(0,255,127)" : "rgb(232, 113, 228)"
        if (buffer === "-") return;
        var id = instrumentName + "-" + (rangeLength - buffer).toString() + "-" + (index % partLength).toString();
        d3.select("#" + id)
            .attr('fill', color)
    });
}

function clearAllSvg(){
    d3.selectAll("rect")
        .attr('fill', "rgb(220, 220, 220)");

}

function toConcatedArrays(a,b) {return a.concat(b)}




