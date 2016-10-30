function getSamples(instrument, range)  {
    var arr = [];
    //TODO: get ugal and penyacah samples for ugal
    instrument = instrument === "ugal" ? "pemade":instrument;
    instrument = instrument === "penyacah" ? "jublag":instrument;

    for (var i = 0; i < range; i++) {
        var filename = instrument + "_" + i.toString() + ".mp3";
        var filePath = "./audio/" + instrument + "/mp3/" + filename;
        arr.push(filePath);
    }
    return arr;
}

function loadGongs() {
   return ["./audio/gongs/mp3/gong.mp3","./audio/gongs/mp3/kemong.mp3"]
}

function setLoop(instrument) {
    return function () {
        var i = 0;
        var q = [];
        var interval;
        var offset = 0;

        //determine the rate of play and the initial offset for an instrumetn
        switch (instrument) {
            case "jegogan":
                interval = "1n";
                offset += "1:0:0";
                break;
            case "jublag":
                interval = "2n";
                offset += "0:1:4";
                break;
            case "penyacah":
            case "ugal":
                interval = "4n";
                offset += "0:0:4";
                break;
            case "pemade":
            case "kantilan":
                interval = "16n";
                offset += "0:0:4";
                break;
            case "reyong":
                interval = "16n";
                offset += "0:1:1";
                break;
        }

        new Tone.Loop(function (time) {
            //handle UI state for keys/pots
            q.forEach(toggleActive);
            q = [];

            //read the appropriate buffers for the index
            if (instrument == "penyacah") {
                return;
            }
            var buffers = readBuffers(instrument, i);
            buffers.forEach(function(buffer){
                //return if it's a rest value
                if (buffer === "-" || players[instrument].mute) return;
                players[instrument].start(buffer);
                players[instrument].stop(buffer, "+" + interval);

                //add the note to be turned on
                q.push(document.getElementById(instrument + " " + buffer));
            });

            q.forEach(toggleActive);
            i++;
        }, interval).start(offset);
    }
}

//returns an array of buffers to be played simultaneously (takes a instrument name and an index)
//TODO: turn 8s into a variable representing the length of the elaboration pattern per pokok tone
function readBuffers(instrument, index) {
    switch (instrument) {
        case "jegogan":
            return [jegogan[index % jegogan.length] - 1];
        case "jublag":
            return [pokok[index % pokok.length] - 1];
        case "penyacah":
            return [neliti[index % neliti.length]];
        case "ugal":
            return [neliti[index % neliti.length]];
        case "pemade":
            return [pemade_part[0][index % (pokok.length * gangsaPatternLength)],
                    pemade_part[1][index % (pokok.length * gangsaPatternLength)]];
        case "kantilan":
            return [kantilan_part[0][index % (pokok.length * gangsaPatternLength)],
                    kantilan_part[1][index % (pokok.length * gangsaPatternLength)]];
        case "reyong":
            return reyong_part.map(function(arr){return arr[index % (pokok.length * reyongPatternLength)]});
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
            if (i % pokok.length === pokok.length / 2 - 1) {
                players["gong"].start(1);
            }
            if (i % pokok.length === pokok.length - 1) {
                players["gong"].start(0);
            }
            i++;
        }, "2n").start("0:1:4");
    }).toMaster();
    players["gong"].fadeIn = 0.1;
    players["gong"].fadeOut = 0.3;
    players["gong"].volume.value = -40;
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

