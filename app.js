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
var reyongPatternType = patternTypes[0];
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
    Instrument.config.forEach(buildInstrument);
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
    players[instrumentName].volume.value = -25;
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
                cItem.classList.add("instrument-name");
                cItem.addEventListener("click", openInstrumentEditor);
                break;
            case 2:
                cItem.classList.add("dropdown-container");
                break
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
                    setReyongPart(Instrument.parts.pokok);
                    showPattern(instrumentName, Instrument.parts.reyong.reduce(toConcatedArrays), 12, reyongPatternLength * Instrument.parts.pokok.length);
                    break;
                case"kantilan":
                    kantilanPatternType = event.target.textContent;
                    setGangsaPart("kantilan", Instrument.parts.pokok);
                    showPattern(instrumentName, Instrument.parts.kantilan.reduce(toConcatedArrays), 10, gangsaPatternLength * Instrument.parts.pokok.length);
                    break;
                case "pemade":
                    pemadePatternType = event.target.textContent;
                    setGangsaPart("pemade", Instrument.parts.pokok);
                    showPattern(instrumentName, Instrument.parts.pemade.reduce(toConcatedArrays), 10, gangsaPatternLength * Instrument.parts.pokok.length);
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
    var editor = document.getElementsByClassName("Instrument.parts.pokok-editor")[0];
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
        updateAllSvgs();
        clearAllFromParent(editor, "gatra");
        pArray.toGatra(4, editor).forEach(function(g){editor.appendChild(g)});
        var r = document.createRange();
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

function openInstrumentEditor() {
    var hider = document.getElementById("hider")
    var editorPopup = document.getElementById("editor-popup");
    toggleClass(editorPopup, "show-popup");
    toggleClass(hider, "show-popup");
    if (editorPopup.classList.contains("show-popup")) {
        //a clone of the instrument
    } else {
    }
}
//**********User Interactions***********
//returns the Instrument.parts.pokok as an array of strings
function getPokokFromEditor(){
    var elements = Array.prototype.slice.call(document.getElementsByClassName("Instrument.parts.pokok-editor")[0].childNodes);
    var pArray = elements.reduce(function(p, element){
        if (element.className === 'gatra') {
            var a = element.innerHTML.split("");
            p = p.concat(a);
        }
        return p;
    },[]);
    return pArray;
}

//set the Instrument.parts.pokok in data as an array of integers
function setPokokParts() {
    //set pokok, jublag and jegogan
    //pokok is in scale degrees, instrument parts are in buffers
    Instrument.parts.pokok = getPokokFromEditor().map(function(n){return parseInt(n)});
    Instrument.parts.jublag = Instrument.parts.pokok.map(function(v){return v - 1});
    Instrument.parts.jegogan = Instrument.parts.pokok.filter(function(n, i){return i%2 != 0});
    console.log("pokok set:", Instrument.parts.pokok);

    //set neliti ugal and penyacah
    for (var i = 1; i < Instrument.parts.pokok.length; i+=2) {
        Instrument.parts.ugal = Instrument.parts.ugal.concat(makeNeliti([Instrument.parts.pokok[i-1], Instrument.parts.pokok[i]]));
    }
    Instrument.parts.neliti = Instrument.parts.ugal.map(function(v){return Instrument.range.pemade[v]});
    Instrument.parts.penyacah = Instrument.parts.neliti.map(function(v){return Instrument.range.penyacah[v]});
    console.log("Neliti set: ", Instrument.parts.neliti);
}


function start(event) {
    event.target.id = "stop";
    event.target.innerHTML = "Stop";

    // start playback
    activateTransport();
    startAnalyzers();
}

function setAllParts() {
    Instrument.resetElaborations();

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
    Tone.Transport.loopEnd = (Instrument.parts.pokok.length / 2).toString() + "m";
    Tone.Transport.start();
}

function toggleClass(el, className) {
    if (el.classList.contains(className)) {
        el.classList.remove(className)
    } else {
        el.classList.add(className)
    }
}




