/**
 * Created by Pete on 9/25/16.
 */

var ids = [];
function createAnalyzer(parent, height, width) {
    var barPadding = 1;
    var frequencyData = new Uint8Array(8);
    var svg = d3.select(parent).append('svg').attr('height', height).attr('width', width);
    svg.frequencyData = frequencyData;
    //render initial state for svg
    svg.selectAll('rect')
        .data(frequencyData)
        .enter()
        .append('rect')
        .attr('fill', 'rgb(0, 255, 127)')
        .attr('width', width / frequencyData.length - barPadding)
        .attr('x', function (d, i) {
            return i * (width / frequencyData.length);
        });
    return svg;
}

//render audio components
function startAnalyzers() {
    // Copy frequency data to frequencyData array.
    var instrumentHeight =  document.getElementById("reyong").offsetHeight;

    for (var analyzer in analyzers) {
        if (analyzers.hasOwnProperty(analyzer)) {
            var svg = analyzers[analyzer].svg;
            svg.frequencyData = analyzers[analyzer].getValue();
            // Update d3 chart with new data.
            svg.selectAll('rect')
                .data(svg.frequencyData)
                .attr('y', function (d) {
                    if (d === Infinity || d === -Infinity) {
                        return 0;
                    }
                    else {
                        return d + 200;
                    }
                })
                .attr('height', function (d) {
                    var height = instrumentHeight - Math.abs(d);
                    return height > 0 ? height : 0;
                })
        }
    }
    ids.push(requestAnimationFrame(startAnalyzers));
}

function stopAnalyzers() {
    ids.forEach(cancelAnimationFrame);
}