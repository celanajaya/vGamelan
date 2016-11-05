//*********Pattern Generation**************
//Setting the elaborations to globally defined arrays
function setReyongPart() {
    var patternFunction = (reyongPatternType === "norot") ? getReyongNorotAtIndex : getReyongKilitanAtIndex;
    Instrument.parts.reyong = Instrument.parts.neliti.reduce(function(elab, cur, i){
        if (i % 2 != 0) {
            //use the last one for the first
            var prev = i > 1 ? Instrument.parts.neliti[i - 2] : Instrument.parts.neliti[Instrument.parts.neliti.length - 1];
            //convert to reyong buffers
            prev = Instrument.range.reyong.indexOf(Instrument.range.ugal[prev]);
            cur =  Instrument.range.reyong.indexOf(Instrument.range.ugal[cur]);
            var lowPattern = patternFunction([prev, cur]);
            var highPattern = lowPattern.map(function(part) {
                return part.map(function(note){
                    if (note === "-") return note;
                    var newNote = note + 5;
                    if (newNote > 11) {
                        var e = new Error("Reyong part out of range");
                        throw e;
                        alert(e);
                    }
                    return newNote;
                });
            });
            var pattern = lowPattern.concat(highPattern);
            pattern[0].forEach(function (note) {elab[0].push(note)});
            pattern[1].forEach(function (note) {elab[1].push(note)});
            pattern[2].forEach(function (note) {elab[2].push(note)});
            pattern[3].forEach(function (note) {elab[3].push(note)});
        }
        return elab
    }, [[],[],[],[]]);
    console.log("reyong part set:", Instrument.parts.reyong);
}

function setGangsaPart(instrument) {
    //take the Instrument.parts.pokok and convert to polos and sangsih arrays
    var patternType;
    var patternFunction;

    if (instrument === "kantilan") {
        patternType = kantilanPatternType;
        Instrument.parts.kantilan = [];
    } else {
        patternType = pemadePatternType;
        Instrument.parts.pemade = [];
    }
    var type;
    switch (patternType) {
        case kTelu:
            type = " telu";
            patternFunction = getGangsaTeluAtIndex;
            break;
        case kNorot:
            type = " norot";
            patternFunction = getGangsaNorotAtIndex;
            break;
        case kNyogCag:
            type = " nyogcag";
            patternFunction = getGangsaNyogCagAtIndex;
            break;
        case kEmpat:
            type = " empat";
            patternFunction = getGangsaEmpatAtIndex;
            break;
    }

    var elab = Instrument.parts.neliti.reduce(function(elab, cur, i){
        if (i % 2 != 0) {
            var prev = i > 1 ? Instrument.parts.neliti[i - 2] : Instrument.parts.neliti[Instrument.parts.neliti.length - 1];
            var pattern = patternFunction([prev, cur]);
            //reduce/concat??
            pattern[0].forEach(function (v) {elab[0].push(v)});
            pattern[1].forEach(function (v) {elab[1].push(v)});
        }
        return elab
    }, [[],[]]);

    if (instrument === "pemade") {
        Instrument.parts.pemade = elab;
        console.log(instrument + " part set: ", Instrument.parts.pemade, type);

    } else {
        Instrument.parts.kantilan = elab;
        console.log(instrument + " part set: ", Instrument.parts.kantilan, type);
    }
}
//************Pattern Calculation Methods*********************
//TODO: basic implementation for empat, and nyog cag

//Reyong
//Part parameter, is an integer from 0-3, corresponding to the positions on the reyong
function getReyongNorotAtIndex(position, index){
    var firstHalfPatternType = (Instrument.parts.pokok[index] !== Instrument.parts.pokok[index - 1]) ? "moving":"staying"
    var firstHalf = reyongNorotBank[Instrument.parts.pokok[index] - 1][position][firstHalfPatternType];
    var secondHalf = reyongNorotBank[Instrument.parts.pokok[index] - 1][position].staying;
    return firstHalf.concat(secondHalf);
}

function getReyongKilitanAtIndex(pokokPair) {
    if (pokokPair[0] != pokokPair[1]) {
        return makeEmpat.move(pokokPair);
    }
    return makeEmpat.stay(pokokPair, empatStayingPattern);
}

//Gangsa
function getGangsaNorotAtIndex(pokokPair) {
    return makeNorot.basicNorot(pokokPair);
}

function getGangsaTeluAtIndex(pokokPair) {
    if (pokokPair[0] != pokokPair[1]) { //moving or staying
        return makeTelu.move(pokokPair);
    } else {
        return makeTelu.stay(pokokPair, teluStayingPattern);
    }
}

function getGangsaNyogCagAtIndex(pokokPair) {
    if (pokokPair[0] !== pokokPair[1]) {
        return makeNyogCag.move(pokokPair, nyogCagMovingPattern);
    } else {
        return makeNyogCag.stay(pokokPair, nyogCagStayingPattern);
    }
}
//
function getGangsaEmpatAtIndex(pokokPair) {
    if (pokokPair[0] != pokokPair[1]) { //moving or staying
        return makeEmpat.move(pokokPair);
    } else {
        return makeEmpat.stay(pokokPair, teluStayingPattern);
    }
}
