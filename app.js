//*************"Class" variables

//"Constants"
var kNorot = "norot";
var kNyogCag = "nyog cag";
var kKilitan = "kilitan";
var kTelu = "kotekan telu";
var kEmpat = "kotekan empat";
var patternTypes = [kKilitan, kNorot, kTelu, kEmpat, kNyogCag];

//Audio Players
var players = {};
var analyzers = {};

//default settings
var pemadePatternType = patternTypes[1];
var kantilanPatternType = patternTypes[1];
var reyongPatternType = patternTypes[1];
var teluStayingPattern = [0,0];
var empatStayingPattern = [0,0];
var nyogCagMovingPattern = 0;
var nyogCagStayingPattern = 0;

//TODO: support polyrhythmic elaborations


//******Building UI**********
function init() {
    setAllParts();
    configurePokokEditor();
    configurePartEditor();
    Tone.Master.connect(new Tone.Normalize(2,4));
    Tone.Transport.bpm.value = 60;
    Gamelan.config.forEach(buildInstrument);

    //TODO: move these two to inside the build instrument methods?
    initializeMuteButtons();
    initializeTempoVolumeSliders();
    configureGong();
};

function initializeTempoVolumeSliders(){
    var tSlider = document.getElementById("tempo-slider");
    setSliderListener(tSlider, function() {
        document.getElementById("tempoValue").innerHTML = tSlider.value;
        Tone.Transport.bpm.value = tSlider.value;
    });

    var vSlider = document.getElementById("master-volume-slider");
    setSliderListener(vSlider, function() {
        // document.getElementById("masterVolume").innerHTML = vSlider.value;
        // Tone.Master.volume.value = tSlider.value;
    });
}

function buildInstrument(config) {
    //grab the DOM element
    var instrumentName = config[0];
    var numKeys = config[1];
    var instrument = document.getElementById(instrumentName);

    //create a player with the array of samples based on the based on the name of the instrument and the range
    //assign a callback function to define the looping behavior for each instrument. This method will get called at set intervals
    //during the Tone.Transport timeline
    players[instrumentName] = new Tone.MultiPlayer(getSamples(instrumentName, numKeys), setLoop(instrumentName)).toMaster();
    players[instrumentName].fadeIn = 0.05;
    players[instrumentName].fadeOut = 0.1;
    analyzers[instrumentName] = new Tone.Analyser("fft", 32);
    players[instrumentName].chain(analyzers[instrumentName], Tone.Master);

    //Controls Stuff
    addControlsForInstrument(instrument);

    //Volume Stuff
    players[instrumentName].volume.value = 0;
    createVolumeSliderForInstrument(instrument);

    //generate keys/pots and add listeners
    createKeysForInstrument(config);

    //hacky way of connecting svg to analyzer
    analyzers[instrumentName].svg = createAnalyzer("#" + config[0], instrument.offsetHeight/2, instrument.offsetWidth);
}

function createKeysForInstrument(config) {
    var numKeys = config[1];
    var instrument = document.getElementById(config[0]);
    for (var i = 0; i < numKeys; i++) {
        var key = document.createElement("div");
        instrument.appendChild(key).className = config[2];
        key.id = config[0] + " " + i.toString();
        key.addEventListener("click", function(event){
            var id = event.target.id.split(" ");
            players[id[0]].start(parseInt(id[1]));
        });
    }
}

function addControlsForInstrument(instrument) {
    var elaboratingPart = (instrument.id === "reyong" || instrument.id === "kantilan" || instrument.id === "pemade");
    var controls = document.createElement("div");
    controls.classList.add("controls");
    controls.id = instrument.id + "-controls";
    var controlItemContainer = document.createElement("div");
    controlItemContainer.classList.add("control-item-container");
    for (var i = 0; i < 4; i++) {
        var cItem = document.createElement("div");
        cItem.classList.add("control-item");
        switch (i) {
            case 0:
                var muteButton = document.createElement("span");
                muteButton.classList.add("mute-button");
                muteButton.innerHTML = "mute";
                cItem.appendChild(muteButton);
                controlItemContainer.appendChild(cItem);
                break;
            case 1:
                cItem.innerHTML = instrument.id;
                cItem.classList.add("instrument-name");
                controlItemContainer.appendChild(cItem);
                break;
            case 3:
                cItem = document.createElement("i");
                cItem.className = "control-item fa fa-cog";
                cItem.id = instrument.id + "-editor";
                cItem.addEventListener("click", openInstrumentEditor(instrument.id));
                controlItemContainer.appendChild(cItem);
                break;
            case 2:
                if (elaboratingPart) {
                    cItem.classList.add("dropdown-container");
                    controlItemContainer.appendChild(cItem);
                }
                break;
        }
    }
    //add elaboration dropdowns for elaborating instruments only
    switch (instrument.id) {
        case "pemade":
        case "kantilan":
        case "reyong":
            var dropdownContainer = controlItemContainer.lastChild.previousSibling;
            addDropDownContentForInstrument(instrument.id, dropdownContainer);
            break;
        default:
            break;
    }

    controls.appendChild(controlItemContainer);
    instrument.appendChild(controls);
    createEditor("#" + controls.id, controls.offsetHeight, controls.offsetWidth);
}

function configurePartEditor() {
    var editor = document.getElementById("part-editor")
    //TODO: add tabs programmatically
    var closeButton = document.getElementById("close");
    closeButton.addEventListener("click", closePartEditor);

}

function createVolumeSliderForInstrument(instrument) {
    var volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.min = -10;
    volumeSlider.max = 10;
    volumeSlider.step = 0.1;
    volumeSlider.id = instrument.id + "-slider";
    volumeSlider.value = 0;
    setSliderListener(volumeSlider, function(){
        players[instrument.id].volume.value = volumeSlider.value;
        console.log(instrument.id + " volume: " + players[instrument.id].volume.value);
    });
    var volumeSliderContainer = document.createElement("div");
    volumeSliderContainer.classList.add("volume-slider-container");
    var label = document.createElement("p");
    label.innerHTML = instrument.id;
    volumeSliderContainer.appendChild(label);
    volumeSliderContainer.appendChild(volumeSlider);
    document.getElementById("mixer-controls").appendChild(volumeSliderContainer);
}

function addDropDownContentForInstrument(instrumentName, container) {
    var dropDown = document.createElement("div");
    dropDown.className = "dropdown";
    var dropDownText;
    var pTypes;
    switch(instrumentName) {
        case "reyong":
            dropDownText = reyongPatternType;
            pTypes = patternTypes.slice(0, -3);
            break;
        case "kantilan":
            pTypes = patternTypes.slice(1);
            dropDownText = kantilanPatternType;
            break;
        case "pemade":
            pTypes = patternTypes.slice(1);
            dropDownText = pemadePatternType;
            break;
    }

    dropDown.textContent = dropDownText;
    var caret = createCaret();
    dropDown.appendChild(caret);
    container.appendChild(dropDown);

    var dropDownContent = document.createElement("div");
    dropDownContent.className = "dropdown-content";
    dropDownContent.id = dropDownContent.className + "-" + instrumentName;
    dropDown.appendChild(dropDownContent);
    dropDown.addEventListener("click", function(){
        toggleClass(dropDownContent, "show");
        toggleClass(caret, "fa-caret-down")
        toggleClass(caret, "fa-caret-left")
    })

    pTypes.forEach(function(pType) {
        var menuItem = document.createElement("p");
        menuItem.innerHTML = pType;
        menuItem.addEventListener("click", function (event) {
            var dropDownTextNode = event.target.parentElement.parentElement.childNodes[0];
            dropDownTextNode.data = event.target.textContent;
            switch (instrumentName) {
                case"reyong":
                    reyongPatternType = event.target.textContent;
                    setReyongPart();
                    break;
                case"kantilan":
                    kantilanPatternType = event.target.textContent;
                    setGangsaPart("kantilan");
                    break;
                case "pemade":
                    pemadePatternType = event.target.textContent;
                    setGangsaPart("pemade");
                    break;
            }
            showPattern(instrumentName, Gamelan.parts[instrumentName].reduce(toConcatedArrays),
                                        Gamelan.range[instrumentName].length,
                                        Gamelan.getPartLength[instrumentName]());
        });
        dropDownContent.appendChild(menuItem);
    });
}

function createCaret(){
    var caret = document.createElement("i");
    caret.className = "fa-caret-left";
    return caret;
}

function setSliderListener(slider, listenerFunction) {
    var listener = function() {
        window.requestAnimationFrame(listenerFunction);
    };

    slider.addEventListener("mousedown", function() {
        listener();
        slider.addEventListener("mousemove", listener);
    });
    slider.addEventListener("mouseup", function() {
        slider.removeEventListener("mousemove", listener);
    });
}

function initializeMuteButtons() {
    var muteButtons = document.getElementsByClassName("mute-button");
    for (var i = 0; i < muteButtons.length; i++) {
        muteButtons[i].id = i;
        muteButtons[i].addEventListener("click", function(event){

            //find player and toggle mute
            var index = parseInt(event.target.id);
            var key = Object.keys(players)[index];
            players[key].mute = !players[key].mute

            //toggle class for UI
            toggleClass(event.target, "active");

        })
    }
}
//TODO: fix cursor placement
function configurePokokEditor() {
    var editor = document.getElementById("pokok-editor");
    editor.addEventListener("keyup", function(e){
        setAllParts();
        updateAllSvgs();
    });
}

function openInstrumentEditor(instrumentName) {
    return function() {
        clearAllEditorKeys();
        var hider = document.getElementById("hider")
        var editorPopup = document.getElementById("editor-popup");
        toggleClass(editorPopup, "show-popup");
        toggleClass(hider, "show-popup");

        var editor = document.getElementById("part-editor");
        editor.id = instrumentName + "-part-editor";

        var row = document.createElement("div");
        row.className = "row";
        row.id = "key-row";
        editor.insertBefore(row, document.getElementById("content"));
        var config = Gamelan.config.filter(function(c){return c[0] === instrumentName})[0];
        for (var i = 0; i < config[1]; i++) {
            var key = document.createElement("div");
            row.appendChild(key).className = config[2];
            key.id = config[0] + " " + i.toString() + "-editor";
            key.addEventListener("click", function(event){
                var id = event.target.id.split(" ");
                players[id[0]].start(parseInt(id[1]));
            });
        }

        createEditor("#"+ editor.id, editor.offsetHeight*1.5, editor.offsetWidth*3.5);
    }
}

function clearAllEditorKeys(){
    var keyRow = document.getElementById("key-row");
    if (keyRow) {
        keyRow.parentNode.removeChild(keyRow);
    }
}

function closePartEditor(){
    var hider = document.getElementById("hider")
    var editorPopup = document.getElementById("editor-popup");
    toggleClass(editorPopup, "show-popup");
    toggleClass(hider, "show-popup");
}

//**********User Interactions***********
//returns the Instrument.parts.pokok as an array of strings
function getPokokFromEditor(){
    var textArr = (document.getElementById("pokok-editor").value.split(""));
    var reg = new RegExp(/^\d+$/);
    return textArr.filter(function(item) {return  reg.test(item)});
}

function setPokokParts() {
    //pokok is in scale degrees, instrument parts are in buffers
    Gamelan.parts.pokok = getPokokFromEditor().map(function(n){return parseInt(n)});
    console.log("pokok set:", Gamelan.parts.pokok);

    Gamelan.parts.jublag = Gamelan.parts.pokok.map(function(v){return v - 1});
    Gamelan.parts.jegogan = Gamelan.parts.jublag.filter(function(n, i){return i%2 != 0});

    //set neliti ugal and penyacah
    for (var i = 1; i < Gamelan.parts.pokok.length; i+=2) {
        Gamelan.parts.ugal = Gamelan.parts.ugal.concat(makeNeliti([Gamelan.parts.pokok[i-1], Gamelan.parts.pokok[i]]));
    }
    Gamelan.parts.neliti = Gamelan.parts.ugal.map(function(v){return Gamelan.range.pemade[v]});
    Gamelan.parts.penyacah = Gamelan.parts.neliti.map(function(v){return v - 1});
    console.log("Neliti set: ", Gamelan.parts.neliti);
}


function start(event) {
    event.target.id = "stop";
    event.target.innerHTML = "Stop";

    // start playback
    activateTransport();
    startAnalyzers();
}

function setAllParts() {
    Gamelan.resetAllParts();

    //set basic melody parts
    setPokokParts();

    //set elaborations
    setReyongPart();
    setGangsaPart("kantilan");
    setGangsaPart("pemade");
}

function stop(event) {
    event.target.id = "start";
    event.target.innerHTML = "Start";
    setTimeout(stopAnalyzers, 2000);
    Tone.Transport.stop();
}

document.getElementsByClassName("playback")[0].addEventListener("click", function(event) {
    if (event.target.id === "start") {
        start(event);
    } else {
        stop(event);
    }
});

function activateTransport() {
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = (Gamelan.parts.pokok.length / 2).toString() + "m";
    Tone.Transport.start();
}

function toggleClass(el, className) {
    if (el.classList.contains(className)) {
        el.classList.remove(className)
    } else {
        el.classList.add(className)
    }
}




