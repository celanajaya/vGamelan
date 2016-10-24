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
                // .attr('stroke', 'rgb(0, 0, 0)')
                .attr('x',squareWidth * row)
                .attr('y', squareHeight * col)
                .attr('id', instrumentName + "-" + col.toString() + "-" + row.toString());
        }
    }
    showPattern();

    return svg;
}


function showPattern() {
    //add the data stuff
}



