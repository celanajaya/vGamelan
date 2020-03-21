function getSamples(instrument, range)  {
    var obj = {};
    //TODO: get ugal and penyacah samples for ugal
    instrument = instrument === "ugal" ? "pemade":instrument;
    instrument = instrument === "penyacah" ? "jublag":instrument;

    for (var i = 0; i < range; i++) {
        var filename = instrument + "_" + i.toString() + ".mp3";
        var filePath = baseURL.remote + "audio/" + instrument + "/mp3/" + filename;
        obj[i] = filePath;
    }
    return obj;
}

function loadGongs() {
    var base = baseURL.remote;
    return {"0" : base + "audio/gongs/mp3/gong_0.mp3", "1" : base + "audio/gongs/mp3/gong_1.mp3", "2" : base + "audio/gongs/mp3/gong_2.mp3"}
}

function loadKajar() {
    var base = baseURL.remote;
    return {"0" : base + "audio/kajar/mp3/kajar.mp3"}
}

function setLoop(instrument) {
    return function () {
        new Tone.Loop(function (time) {

            var positionArray = Tone.Transport.position.split(":");

            var beat = parseInt(positionArray[1]);
            var sixteenth = parseInt(positionArray[2]);

            var buffers = readBuffers(instrument, Gamelan.playbackCoordinator[instrument]);
            buffers.forEach(function(buffer){
                //return if it's a rest value
                var rangeHeight = Gamelan.range[instrument].length;
                var uiElem = document.getElementById(instrument + " " + buffer);

                if (buffer === "-" || players[instrument].mute) {
                    //Don't play rests or on muted players
                    return;
                }

                var partLength = Gamelan.getPartLength[instrument]();

                //Sometimes patterns calculated return keys that are out of range
                if (buffer >= rangeHeight) {
                    console.log("Error: Buffer " + buffer + " for instrument " + instrument + " is out of range");
                    return;
                }

                //play buffer
                players[instrument].get(buffer).start(time);

                //animate virtual instrument
                turnOn(uiElem);

                //active svg blocks
                var d3ID = "#" + instrument + "-" + ((rangeHeight - 1) - buffer).toString() + "-" + (Gamelan.playbackCoordinator[instrument] % partLength).toString();
                d3.selectAll(d3ID).attr('fill', 'rgb(0,255,127)');

                players[instrument].get(buffer).stop( "+" + Gamelan.interval[instrument]());

                Tone.Transport.scheduleOnce(function(time){
                    turnOff(uiElem);
                    d3.selectAll(d3ID).attr('fill', 'rgb(237,51,207)');
                }, "+" + Gamelan.interval[instrument]());

            });
            Gamelan.playbackCoordinator[instrument] += 1;
        }, Gamelan.interval[instrument]()).start(Gamelan.offset[instrument]);
    }
}

//returns an array of buffers to be played simultaneously (takes a instrument name and an index)
function readBuffers(instrument, index) {
    switch (instrument) {
        //melody instruments
        case "jegogan":
        case "jublag":
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
    players["gong"] = new Tone.Players(loadGongs(), function () {
        new Tone.Loop(function (time) {

            var cyclePoint = (Gamelan.playbackCoordinator["gong"] % Gamelan.parts.pokok.length);

            if (cyclePoint === (Gamelan.parts.pokok.length / 4)) {
                players["gong"].get("1").start();
                players["gong"].get("1").stop("+2n");

                console.log("played kempur");
            }

            if (cyclePoint === (Gamelan.parts.pokok.length / 4) * 3) {
                players["gong"].get("1").start();
                players["gong"].get("1").stop("+2n");

                console.log("played kempur");
            }

            if (cyclePoint === Gamelan.parts.pokok.length / 2) {
                players["gong"].get("2").start();
                players["gong"].get("2").stop("+2n");

                console.log("Played klentong");
            }

            if (cyclePoint === 0) {

                players["gong"].get("0").start();
                players["gong"].get("0").stop("+2n");

                console.log("played gong");
            }
            Gamelan.playbackCoordinator["gong"] += 1;

        }, "2n").start("0:1:3");
    }).toMaster();

    players["gong"].fadeIn = 0.01;
    players["gong"].fadeOut = 0.1;

}

function configureKajar() {
    players["kajar"] = new Tone.Players(loadKajar(), function () {

        new Tone.Loop(function (time) {

            players["kajar"].get("0").start();
            console.log("played a kajar note");
        }, "4n").start("0:0:3");

    }).toMaster();

    players["kajar"].fadeIn = 0.01;
}

//handle animations
function toggleActive(item) {
    if (!item) return;
    if (item.classList.contains("active")){
        item.classList.remove("active")
    } else {
        item.classList.add("active");
    }
}

function turnOn(item) {
    if (!item) return;
    if (!item.classList.contains("active")){
        item.classList.add("active");
    }
}

function turnOff(item) {
    if (!item) return;
    if (item.classList.contains("active")){
        item.classList.remove("active");
    }
}