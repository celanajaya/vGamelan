//*********Pattern Generation**************
//Setting the elaborations to globally defined arrays
function setReyongPart(pokok) {
    reyong_part = [];
    var patternFunction = (reyongPatternType === "norot") ? getReyongNorotAtIndex : getReyongKilitanAtIndex;
    for (var i = 0; i < 4; i++) {
        var rPattern = [];
        for (var j = 0; j < pokok.length; j++) {
            rPattern = rPattern.concat(patternFunction(i,j));
        }
        reyong_part[i] = rPattern;
    }
    // console.log("reyong part set:", reyong_part);
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
    }
    switch (patternType) {
        case kTelu:
            patternFunction = getGangsaTeluAtIndex;
            break;
        case kNorot:
            patternFunction = getGangsaNorotAtIndex;
            break;
        case kNyogCag:
            patternFunction = getGangsaNyogCagAtIndex;
            break;
        case kEmpat:
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
        // console.log(instrument + " part set: ", pemade_part);

    } else {
        kantilan_part = elab;
        // console.log(instrument + " part set: ", kantilan_part);
    }
}

function setNeliti(pokok) {
    for (var i = 1; i < pokok.length; i+=2) {
        neliti = neliti.concat(makeNeliti([pokok[i-1], pokok[i]]));
    }
    // console.log("neliti set: ", neliti);
}

//************Pattern Calculation Methods*********************
//TODO: add separate polos and sangsih outputs
//TODO: create better methods for mapping an elaboration to an instrument
//TODO: basic implementation for norot, telu, empat, and nyog cag for both reyong and gangsa

//Reyong
//Part parameter, is an integer from 0-3, corresponding to the positions on the reyong
function getReyongNorotAtIndex(position, index){
    var firstHalfPatternType = (pokok[index] !== pokok[index - 1]) ? "moving":"staying"
    var firstHalf = reyongNorotBank[pokok[index] - 1][position][firstHalfPatternType];
    var secondHalf = reyongNorotBank[pokok[index] - 1][position].staying;
    return firstHalf.concat(secondHalf);
}

function getReyongKilitanAtIndex(position, index) {
    var currentNote = pokok[index];
    var previousNote = pokok[index - 1];
    if (!previousNote) {
        previousNote = pokok[pokok.length - 1];
    }

    //determine whether to assign the buffer polos or sangsih
    var part = position % 2 === 0 ? "polos":"sangsih";
    var ambitus = position < 2 ? reyongRange.slice(0,6):reyongRange.slice(6, reyongRange.length);

    if (currentNote !== previousNote) {
        var e = makeEmpat.move([previousNote, currentNote], part).map(function(scaleDegree){
            var index = ambitus.indexOf(scaleDegree);
            //hack to fix out of bounds issues
            if (index === -1 && position < 2) {
                index += 3;
            }
            return position < 2 ? index:index + 5;
        });
        return e;
    } else {
        var e = makeEmpat.stay([previousNote, currentNote], part, empatStayingPattern).map(function(scaleDegree){
            var index = ambitus.indexOf(scaleDegree);
            //hack to fix out of bounds issues;
            if (index === -1 && position < 2) {
                index += 3;
            }
            return position < 2 ? index:index + 5;
        });
        return e;
    }
}

//Gangsa
function getGangsaNorotAtIndex(pokokPair) {
    return makeNorot.basicNorot(pokokPair);
}

function getNgempat(num) {
    var ngempat = num + 3;
    if (ngempat > 5) {
        ngempat = ngempat % 5;
    }
    return ngempat;
}

//take each sub-array and make sure the pitches are adjacent to the pokokTone (which is always the last one)
//TELU HELPERS
//pair == POKOK tones
function getGangsaTeluAtIndex(pokokPair) {
    if (pokokPair[0] != pokokPair[1]) { //moving or staying
        return makeTelu.move(pokokPair);
    } else {
        return makeTelu.stay(pokokPair, teluStayingPattern);
    }
}

function getGangsaNyogCagAtIndex(pokokPair) {
    if (pokokPair[0] !== pokokPair[1]) {
        return makeNyogCag.move(pokokPair);
    } else {
        return makeNyogCag.stay(pokokPair);
    }
}
//
// function getGangsaEmpatAtIndex(part, index) {
//     var currentNote = pokok[index];
//     var previousNote = pokok[index - 1];
//     if (!previousNote) {
//         previousNote = pokok[pokok.length - 1];
//     }
//     if (currentNote !== previousNote) {
//         return makeEmpat.move([previousNote, currentNote], part)
//             .map(scaleDegreeToGangsaKey);
//     } else {
//         return makeEmpat.stay([previousNote, currentNote], part, empatStayingPattern)
//             .map(scaleDegreeToGangsaKey);
//     }
// }