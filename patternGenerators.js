//*********Pattern Generation**************
//Setting the elaborations to globally defined arrays
function setReyongPart(pokok) {
    var patternFunction = (reyongPatternType === "norot") ? getReyongNorotAtIndex : getReyongKilitanAtIndex;
    reyong_part = neliti.reduce(function(elab, cur, i){
        if (i % 2 != 0) {
            //use the last one for the first
            var prev = i > 1 ? neliti[i - 2] : neliti[neliti.length - 1];
            //convert to reyong buffers
            prev = reyongRange.indexOf(gangsaRange[prev]);
            cur =  reyongRange.indexOf(gangsaRange[cur]);
            var lowPattern = patternFunction([prev, cur]);
            var highPattern = lowPattern.map(function(part) {
                return part.map(function(note){
                    if (note === "-") return note;
                    var newNote = note + 5;
                    if (newNote > 11) {
                        throw new Error("Reyong part out of range");
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
    console.log("reyong part set:", reyong_part);
}

function setGangsaPart(instrument, pokok) {
    //take the pokok and convert to polos and sangsih arrays
    var patternType;
    var patternFunction;

    if (instrument === "kantilan") {
        patternType = kantilanPatternType;
        kantilan_part = [];
    } else {
        patternType = pemadePatternType;
        pemade_part = [];
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

    var elab = neliti.reduce(function(elab, cur, i){
        if (i % 2 != 0) {
            var prev = i > 1 ? neliti[i - 2] : neliti[neliti.length - 1];
            var pattern = patternFunction([prev, cur]);
            //reduce/concat??
            pattern[0].forEach(function (v) {elab[0].push(v)});
            pattern[1].forEach(function (v) {elab[1].push(v)});
        }
        return elab
    }, [[],[]]);

    if (instrument === "pemade") {
        pemade_part = elab;
        console.log(instrument + " part set: ", pemade_part, type);

    } else {
        kantilan_part = elab;
        console.log(instrument + " part set: ", kantilan_part, type);
    }
}

function setNeliti(pokok) {
    for (var i = 1; i < pokok.length; i+=2) {
        neliti = neliti.concat(makeNeliti([pokok[i-1], pokok[i]]));
    }
    console.log("neliti set: ", neliti);
}

//************Pattern Calculation Methods*********************
//TODO: basic implementation for empat, and nyog cag

//Reyong
//Part parameter, is an integer from 0-3, corresponding to the positions on the reyong
function getReyongNorotAtIndex(position, index){
    var firstHalfPatternType = (pokok[index] !== pokok[index - 1]) ? "moving":"staying"
    var firstHalf = reyongNorotBank[pokok[index] - 1][position][firstHalfPatternType];
    var secondHalf = reyongNorotBank[pokok[index] - 1][position].staying;
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
