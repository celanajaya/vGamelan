function createEditor(parent, height, width) {
    var instrumentName = parent.split("-")[0].slice(1);
    var part;
    var rangeLength;
    var partLength;
    var meter;

    var svg = d3.select(parent).append('svg').attr('height', height).attr('width', width);
    var len = reyongRange.length;
    var splitRange = [reyongRange.splice(0, len / 2), reyongRange.splice(len / 2, len)];


    function getAllGangsaBuffers(a, b) {

        function partToBuffers(item) {
            if (item === "-") return item
            var gangsaKey = gangsaRange.indexOf(item);
            gangsaKey = gangsaKey < 2 ? gangsaKey + 5 : gangsaKey;
            return gangsaKey
        }

        return a.concat(b.map(partToBuffers))
    }

    //TODO: fix reyong elaboration
    function getAllReyongBuffers(a, b) {
        var part = 1;
        function partToBuffers(item) {
            if (item === "-") return item
            var octave = part < 2 ? 0:1;
            return splitRange[octave].indexOf(item)
        }

        return function () {
            part++;
            return a.concat(b);
        }()
    }


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
            part = pemade_part.reduce(getAllGangsaBuffers, []);
            rangeLength = gangsaRange.length;
            partLength = pokok.length * 8;
            meter = 8;
            break;
        case"kantilan":
            part = kantilan_part.reduce(getAllGangsaBuffers, []);
            partLength = pokok.length * 8;
            rangeLength = gangsaRange.length;
            meter = 8;
            break;
        case"reyong":
            part = reyong_part.reduce(getAllReyongBuffers, []);
            rangeLength = 12;
            partLength = pokok.length * 8;
            meter = 8;
            break;
    }
    for (var col = 0; col < rangeLength; col++) {
        for (var row = 0; row < partLength; row++) {
            var squareWidth = width / partLength;
            var squareHeight = height / rangeLength;
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
    //add the data stuff
    return function() {
        part.forEach(function (buffer, index) {
            var color = index > partLength ? "rgb(0,255,127)" : "rgb(232, 113, 228)"
            if (buffer === "-") return;
            var id = instrumentName + "-" + (rangeLength - buffer).toString() + "-" + (index % partLength).toString();
            d3.select("#" + id)
                .attr('fill', color)
        });
    }();
}

function clearAllSvg(){
    d3.selectAll("rect")
        .attr('fill', "rgb(220, 220, 220)");
}




