function getSamples(instrument, range)  {
    var arr = [];
    //TODO: get ugal and penyacah samples for ugal
    instrument = instrument === "ugal" ? "pemade":instrument;
    instrument = instrument === "penyacah" ? "jublag":instrument;

    for (var i = 0; i < range; i++) {
        var filename = instrument + "_" + i.toString() + ".mp3";
        var filePath = baseURL.local + "audio/" + instrument + "/mp3/" + filename;
        arr.push(filePath);
    }
    return arr;
}

function loadGongs() {
    var base = baseURL.local;
   return [base + "audio/gongs/mp3/gong.mp3", base + "audio/gongs/mp3/kemong.mp3"]
}

function setLoop(instrument) {
    return function () {
        var i = 0;
        new Tone.Loop(function (time) {

            var buffers = readBuffers(instrument, i);
            buffers.forEach(function(buffer){
                //return if it's a rest value
                if (buffer === "-" || players[instrument].mute) return;
                var uiElem = document.getElementById(instrument + " " + buffer);
                var rangeHeight = Gamelan.range[instrument].length;
                var partLength = Gamelan.getPartLength[instrument]();

                //play buffer
                players[instrument].start(buffer, time);

                //active svg blocks
                var d3ID = "#" + instrument + "-" + ((rangeHeight - 1) - buffer).toString() + "-" + (i % partLength).toString();
                d3.selectAll(d3ID).attr('fill', 'rgb(0,255,127)');

                players[instrument].stop(buffer, "+" + Gamelan.interval[instrument]());
                Tone.Transport.scheduleOnce(function(time){
                    d3.selectAll(d3ID).attr('fill', 'rgb(237,51,207)');
                }, "+" + Gamelan.interval[instrument]());

            });
            i++;
        }, Gamelan.interval[instrument]()).start(Gamelan.offset[instrument]);
    }
}

//returns an array of buffers to be played simultaneously (takes a instrument name and an index)
function readBuffers(instrument, index) {
    switch (instrument) {
        //melody instruments
        case "jegogan":
        case "jublag":
        case "penyacah":
        case "ugal":
            return [Gamelan.parts[instrument][index % Gamelan.getPartLength[instrument]()]];

        //elaborating instruments
        case "pemade":
        case "kantilan":
        case "reyong":
            return Gamelan.parts[instrument].map(function(arr){
                return arr[index % Gamelan.getPartLength[instrument]()];
            });
    }
}

function configureGong() {
    players["gong"] = new Tone.MultiPlayer(loadGongs(), function () {
        var i = 0;
        new Tone.Loop(function (time) {
            if (i === 0) {
                i++;
                return;
            }
            if (i % Gamelan.parts.pokok.length === Gamelan.parts.pokok.length / 2 - 1) {
                players["gong"].start(1);
            }
            if (i % Gamelan.parts.pokok.length === Gamelan.parts.pokok.length - 1) {
                players["gong"].start(0);
            }
            i++;
        }, "2n").start("0:1:3");
    }).toMaster();
    players["gong"].fadeIn = 0.1;
    players["gong"].fadeOut = 0.3;
    players["gong"].volume.value = -30;
}