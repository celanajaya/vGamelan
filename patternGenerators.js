//*********Pattern Generation**************
//Setting the elaborations to globally defined arrays
function setReyongPart() {
    var patternFunction = (reyongPatternType === "norot") ? getReyongNorotAtIndex : getReyongKilitanAtIndex;
    Gamelan.parts.reyong = Gamelan.parts.neliti.reduce(function(elab, cur, i){
        if (i % 2 != 0) {
            //use the last one for the first
            var prev = i > 1 ? Gamelan.parts.neliti[i - 2] : Gamelan.parts.neliti[Gamelan.parts.neliti.length - 1];
            var pattern;
            if (reyongPatternType === "kilitan") {
                //convert to reyong buffers
                prev = Gamelan.range.reyong.indexOf(prev);
                cur =  Gamelan.range.reyong.indexOf(cur);

                var lowPattern = patternFunction([prev, cur]).map(function(part){
                    return part.map(function(note){
                        if (note === "-") return note;
                        if (note < 0) {
                            console.log("Reyong part out of range adding a rest instead");
                            return "-";
                        }
                        return note;
                    })
                });
                var highPattern = lowPattern.map(function (part) {
                    return part.map(function (note) {
                        if (note === "-") return note;
                        var newNote = note + 5;
                        if (newNote > 11) {
                            console.log("Reyong part out range adding a rest instead");
                            return "-";
                        }
                        return newNote;
                    });
                });
                pattern = lowPattern.concat(highPattern);
            } else {
                pattern = patternFunction([prev, cur]);
            }
            pattern[0].forEach(function (note) {elab[0].push(note)});
            pattern[1].forEach(function (note) {elab[1].push(note)});
            pattern[2].forEach(function (note) {elab[2].push(note)});
            pattern[3].forEach(function (note) {elab[3].push(note)});
        }
        return elab
    }, [[],[],[],[]]);
    console.log("reyong part set:", Gamelan.parts.reyong);
}

function setGangsaPart(instrument) {
    //take the Instrument.parts.pokok and convert to polos and sangsih arrays
    var patternType;
    var patternFunction;

    if (instrument === "kantilan") {
        patternType = kantilanPatternType;
        Gamelan.parts.kantilan = [];
    } else {
        patternType = pemadePatternType;
        Gamelan.parts.pemade = [];
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

    //generate elaboration
    //TODO: this needs refactoring to be more general
        var elab = Gamelan.parts.ugal.reduce(function (elab, cur, i) {
            var prev = i > 1 ? Gamelan.parts.ugal[i - 1] : Gamelan.parts.ugal[Gamelan.parts.ugal.length - 1];
            if (i % 2 != 0 && patternType != kMalPal && patternType != kNeliti) {
                var pattern = [];
                if (patternType === kGambangan) { //gambangan
                    //gambangan
                    var polos = ["-", cur, "-", prev, cur, prev, "-", cur];
                    var sangsih = polos.atRotation(1);
                    pattern = [polos, sangsih];
                } else {
                    //other patterns
                    var prevJublag = i > 1 ? Gamelan.parts.ugal[i - 2] : Gamelan.parts.ugal[Gamelan.parts.ugal.length - 1];
                    pattern = patternFunction([prevJublag, cur]);
                }

                //reduce/concat??
                pattern[0].forEach(function (v) {
                    elab[0].push(v)
                });
                pattern[1].forEach(function (v) {
                    elab[1].push(v)
                });

            }

            else if (patternType === kMalPal) { //malpal
                elab[0] = elab[0].concat(["-", prev, "-", cur]);
                var cS = cur + 3 > 9 ? cur : cur + 3;
                var pS = prev + 3 > 9 ? prev : prev + 3;
                elab[1] = elab[1].concat(["-", pS, "-", cS]);
            }

            else if (patternType === kNeliti) { // neliti
                elab[0] = elab[0].concat(["-", "-", "-", cur]);
                var cS = cur + 3 > 9 ? cur : cur + 3;
                elab[1] = elab[1].concat(["-", "-", "-", cS]);
            }

            return elab
        }, [[], []]);

    if (instrument === "pemade") {
        Gamelan.parts.pemade = elab;
        console.log(instrument + " part set: ", Gamelan.parts.pemade, patternType);

    } else {
        Gamelan.parts.kantilan = elab;
        console.log(instrument + " part set: ", Gamelan.parts.kantilan, patternType);
    }
}
//************Pattern Calculation Methods******************
//Reyong
//Part parameter, is an integer from 0-3, corresponding to the positions on the reyong
function getReyongNorotAtIndex(pokokPair){
    if (pokokPair[0] != pokokPair[1]) {
        return makeReyongNorot.move(pokokPair);
    }
    return makeReyongNorot.stay(pokokPair, empatStayingPattern);
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
