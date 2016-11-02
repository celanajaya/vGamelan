//*************"Class" variables
var instrumentConfig = [["reyong", 12, "pot"],
                        ["kantilan", 10, "key"],
                        ["pemade", 10, "key"],
                        ["ugal", 10, "key"],
                        ["penyacah", 5, "key"],
                        ["jublag", 5, "key"],
                        ["jegogan", 5, "key"]];
//"Constants"
var kNorot = "norot";
var kNyogCag = "nyog cag";
var kKilitan = "kilitan";
var kTelu = "kotekan telu";
var kEmpat = "kotekan empat";
var patternTypes = [kKilitan, kNorot, kTelu, kEmpat, kNyogCag];

//Instrument Ranges
//an array showing the scale tones on the instrument
var gangsaRange = [].instrumentRange(10, 2, 5);
var reyongRange = [].instrumentRange(12, 3, 5);
var jublagRange = [].instrumentRange(5, 0, 5);
var jegoganRange = [].instrumentRange(5, 0, 5)

//Audio Players
var players = {};
var analyzers = {};

//initial arrays of buffer indices
var reyong_part = [[],[],[],[]];
var pemade_part = [[],[]];
var kantilan_part = [[],[]];
var neliti = [];
var pokok = [];
var jegogan = [];

function resetElaborations() {
    reyong_part = [];
    pemade_part = [];
    kantilan_part = [];
    neliti = [];
    pokok = [];
    jegogan = [];
}

//default settings
var pemadePatternType = patternTypes[1];
var kantilanPatternType = patternTypes[1];
var reyongPatternType = patternTypes[1];
var teluStayingPattern = [0,0];
var empatStayingPattern = [0,0];
var nyogCagMovingPattern = 0;
var nyogCagStayingPattern = 0;

//TODO: support polyrhythmic elaborations
var gangsaPatternLength = 8;
var reyongPatternLength = 8;
var meter = 8;

//******Building UI**********
function init() {
    setAllParts();
    configurePokokEditor();
    instrumentConfig.forEach(buildInstrument);
    initializeMuteButtons();
    initializeTempoVolumeSliders()
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
        document.getElementById("masterVolume").innerHTML = vSlider.value;
        Tone.Master.volume = tSlider.value;
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
    players[instrumentName].fadeOut = 0.3;
    analyzers[instrumentName] = new Tone.Analyser("fft", 32);
    players[instrumentName].chain(analyzers[instrumentName], Tone.Master);

    //Controls Stuff
    addControlsForInstrument(instrument);

    //Volume Stuff
    players[instrumentName].volume.value = -50;
    createVolumeSliderForInstrument(instrument);

    //generate keys/pots and add listeners
    for (var i = 0; i < numKeys; i++) {
        var key = document.createElement("div");
        instrument.appendChild(key).className = config[2];
        key.id = config[0] + " " + i.toString();
        key.addEventListener("click", function(event){
            var id = event.target.id.split(" ");
            players[id[0]].start(parseInt(id[1]));
        });
    }

    //hacky way of connecting svg to analyzer
    analyzers[instrumentName].svg = createAnalyzer("#" + config[0], instrument.offsetHeight/2, instrument.offsetWidth);
}

function addControlsForInstrument(instrument) {
    var controls = document.createElement("div");
    controls.classList.add("controls");
    controls.id = instrument.id + "-controls";
    var controlItemContainer = document.createElement("div");
    controlItemContainer.classList.add("control-item-container");
    for (var i = 0; i < 3; i++) {
        var cItem = document.createElement("div");
        cItem.classList.add("control-item");
        switch (i) {
            case 0:
                var muteButton = document.createElement("span");
                muteButton.classList.add("mute-button");
                muteButton.innerHTML = "mute";
                cItem.appendChild(muteButton);
                break;
            case 1:
                cItem.innerHTML = instrument.id;
                break;
            case 2:
                cItem.classList.add("dropdown-container");
                break;
        }
        controlItemContainer.appendChild(cItem);
    }
    //add elaboration dropdowns for elaborating instruments only
    switch (instrument.id) {
        case "pemade":
        case "kantilan":
        case "reyong":
            var dropdownContainer = controlItemContainer.lastChild;
            addDropDownContentForInstrument(instrument.id, dropdownContainer);
            break;
        default:
            break;
    }

    controls.appendChild(controlItemContainer);
    instrument.appendChild(controls);
    createEditor("#" + controls.id, controls.offsetHeight, controls.offsetWidth);
}

function createVolumeSliderForInstrument(instrument) {
    var volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.min = -100;
    volumeSlider.max = 0;
    volumeSlider.step = 1;
    volumeSlider.id = instrument.id + "-slider";
    volumeSlider.value = -50;
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
    dropDown.appendChild(createCaret());
    container.appendChild(dropDown);

    var dropDownContent = document.createElement("div");
    dropDownContent.className = "dropdown-content";
    dropDownContent.id = dropDownContent.className + "-" + instrumentName;
    dropDown.appendChild(dropDownContent);
    dropDown.addEventListener("click", function(){
        toggleClass(dropDownContent, "show");
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
                    setReyongPart(pokok);
                    showPattern(instrumentName, reyong_part.reduce(toConcatedArrays), 12, reyongPatternLength * pokok.length);
                    break;
                case"kantilan":
                    kantilanPatternType = event.target.textContent;
                    setGangsaPart("kantilan", pokok);
                    showPattern(instrumentName, kantilan_part.reduce(toConcatedArrays), 10, gangsaPatternLength * pokok.length);
                    break;
                case "pemade":
                    pemadePatternType = event.target.textContent;
                    setGangsaPart("pemade", pokok);
                    showPattern(instrumentName, pemade_part.reduce(toConcatedArrays), 10, gangsaPatternLength * pokok.length);
                    break;
            }
        });
        dropDownContent.appendChild(menuItem);
    });
}

function createCaret(){
    var caret = document.createElement("span");
    caret.className = "caret";
    caret.classList.add("up");
    caret.innerHTML = " ▾";
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
            if (event.target.classList.contains("active")) {
                event.target.classList.remove("active");
            } else {
                event.target.classList.add("active");
            }

        })
    }
}
//TODO: fix cursor placement
function configurePokokEditor() {
    var editor = document.getElementsByClassName("pokok-editor")[0];
    var val = editor.innerHTML;
    var savedOffset = 0;

    editor.addEventListener("keydown", function(e){
        var r = window.getSelection().getRangeAt(0);
        savedOffset = [r.offsetStart];
    });

    editor.addEventListener("keyup", function(e){
        if (e.keyCode < 49 || e.keyCode > 54) {
            editor.innerHTML = val;
            return;
        }
        var pArray = getPokokFromEditor();
        setAllParts();
        //TODO: update editor
        clearAllFromParent(editor, "gatra");
        pArray.toGatra(4, editor).forEach(function(g){editor.appendChild(g)});
        var r = document.createRange()
        r.setStart(editor.lastChild, savedOffset);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(r)
    });
}

function clearAllFromParent(parent, className) {
    var children = Array.prototype.slice.call(parent.childNodes)
    var elementsToRemove = children.filter(function(item) {return item.className === className});
    elementsToRemove.forEach(function(c){parent.removeChild(c)});
}
//**********User Interactions***********
//returns the pokok as an array of strings
function getPokokFromEditor(){
    var elements = Array.prototype.slice.call(document.getElementsByClassName("pokok-editor")[0].childNodes);
    var pArray = elements.reduce(function(p, element){
        if (element.className === 'gatra') {
            var a = element.innerHTML.split("");
            p = p.concat(a);
        }
        return p;
    },[]);
    return pArray;
}

//set the pokok in data as an array of integers
function setPokokArray() {
    pokok = getPokokFromEditor().map(function(n){return parseInt(n)});
}

function start(event) {
    event.target.id = "stop";
    event.target.innerHTML = "Stop";

    // start playback
    activateTransport();
    startAnalyzers();
}

function setAllParts() {
    resetElaborations();

    //set basic melody parts
    setPokokArray();
    setNeliti(pokok);
    jegogan = pokok.filter(function(n, i){return i%2 != 0});

    //set elaborations
    setReyongPart(pokok);
    setGangsaPart("kantilan", pokok);
    setGangsaPart("pemade", pokok);
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
    Tone.Transport.loopEnd = (pokok.length / 2).toString() + "m";
    Tone.Transport.start();
}

function toggleClass(el, className) {
    if (el.classList.contains(className)) {
        el.classList.remove(className)
    } else {
        el.classList.add(className)
    }
}




