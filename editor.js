function createEditor(parent, totalHeight, totalWidth, instrumentName) {
    if (!instrumentName) {
        instrumentName = parent.split("-")[0].slice(1);
    }
    //instrumental part
    var part = Gamelan.parts[instrumentName];
    //number of keys/pots, used as y value
    var rangeHeight = Gamelan.range[instrumentName].length;
    //total length of pattern, used as x value
    var partLength = Gamelan.getPartLength[instrumentName]();

    var svg = d3.select(parent).append('svg').attr('viewBox', "0 0 " + totalWidth + " " + totalHeight).attr('height', totalHeight).attr('width', totalWidth);
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
            var boxColor = x % Gamelan.meter === Gamelan.meter - 1 ? 'rgb(200, 200, 200)':'rgb(220, 220, 220)';
            svg.append('rect')
                .attr('viewBox', '' + y + '' + x + ' 10 10')
                .attr('height', totalHeight / rangeHeight)
                .attr('width', totalWidth / partLength)
                .attr('fill', boxColor)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.05)
                .attr('x', (totalWidth / partLength) * x)
                .attr('y',(totalHeight / rangeHeight) * y)
                .attr('id', instrumentName + "-" + y.toString() + "-" + x.toString())
                .on('click', rectClick)
        }
    }
    showPattern(instrumentName, part, rangeHeight, partLength);
    return svg;
}

function showPattern(instrumentName, part, rangeHeight, partLength) {
    clearAllForInstrument(instrumentName);
    part.forEach(function (buffer, index) {
        if (buffer === "-") return;
        var id = instrumentName + "-" + ((rangeHeight - 1) - buffer).toString() + "-" + (index % partLength).toString();
        var rect = d3.select("#" + id);
        rect.attr('fill', 'rgb(237,51,207)');
    });
}

function rectClick(){
    if (this.parentNode.classList.contains('edit-mode')) {
        var components = this.id.split("-");
        var instrumentName = components[0];
        var buffer = components[1];
        var partIndex = components[2];
        players[instrumentName].start(buffer);
        Gamelan.parts[instrumentName][partIndex] = partIndex;
        rect.attr('fill', 'rgb(237,51,207)');
    }
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
    var part = 64;
    for (var y = 0; y < range; y++) {
        for (var x = 0; x < part; x++) {
            var i_Selector = "#" + instrumentName;
            var rect = d3.select(i_Selector + "-" + y.toString() + "-" + x.toString());
            rect.attr('fill', 'rgb(220, 220, 220)');
        }
    }
}

function toConcatedArrays(a,b) {return a.concat(b)};