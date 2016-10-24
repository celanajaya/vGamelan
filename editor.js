function createEditor(parent, height, width) {
    var instrumentName = parent.split("-")[0].slice(1);
    var part;
    var range;

    var svg = d3.select(parent).append('svg').attr('height', height).attr('width', width);

    switch (instrumentName) {
        case "jegogan":
            part = jegogan;
            range = jegoganRange;
            break;
        case "jublag":
            part= pokok;
            range = jublagRange;
            break;
        case"penyacah":
        case "ugal":
            part = neliti;
            range = gangsaRange;
            break;
        case"pemade":
            part = pemade_part[0]
            range = gangsaRange;
            break;
        case"kantilan":
            part = kantilan_part[0];
            range = gangsaRange;
            break;
        case"reyong":
            part = reyong_part[0];
            range = reyongRange;
            break;
    }

    for (var col = 0; col < range.length; col++) {
        for (var row = 0; row < part.length; row++) {
            var squareWidth = width / part.length;
            var squareHeight = height / range.length;
            svg.append('rect')
                .attr('width', squareWidth)
                .attr('height', squareHeight)
                .attr('fill', 'rgb(220, 220, 220)')
                .attr('stroke', 'black')
                .attr('stroke-width', 0.05)
                .attr('x',squareWidth * row)
                .attr('y', squareHeight * col)
                .attr('id', instrumentName + "-" + col.toString() + "-" + row.toString());
        }
    }
    showPattern(instrumentName, part, range.length);
    return svg;
}


function showPattern(instrumentName, part, range) {
    //add the data stuff
    return function() {
        // clearAllSvg();
        part.forEach(function (note, index) {
            if (note === "-") return;
            var id = instrumentName + "-" + (range - note).toString() + "-" + index.toString();
            d3.select("#" + id)
                .attr('fill', "rgb(232, 113, 228)");
        });
    }();
}

function clearAllSvg(){
    d3.selectAll("rect")
        .attr('fill', "rgb(220, 220, 220)");
}




