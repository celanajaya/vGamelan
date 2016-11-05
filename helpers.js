//SPECIAL ARRAY METHODS

//special method for rotating arrays
Array.prototype.atRotation = function (index) {
    //return a rotated version of the array
    return this.slice(index, this.length).concat(this.slice(0, index));
}

//special hacky method for getting instrument ranges
Array.prototype.instrumentRange = function(upperBound, lowerBound, mod) {
    if (lowerBound) {
        return Array.apply(null, Array(upperBound + lowerBound - 1)).map(function (_, i) {return (i%mod) + 1;}).slice(lowerBound - 1);
    } else {
        return Array.apply(null, Array(upperBound)).map(function (_, i) {return (i%mod) + 1;});
    }
}

//use when converting a kotekan part to an audio buffer number
Array.prototype.indexForValue = function(value) {
    return value === "-" ? "-" : this.indexOf(value);
};

Array.prototype.toNotation = function(newLine) {
    return this.map(function(item, index){
        if (index % newLine === newLine - 1) {
            return item.toString() + "<br>";
        } else {
            return item.toString()
        }
    }).join(" ");
}

//moves any extra items to a new gatra
Array.prototype.toGatra = function(mod, parent) {
    return this.reduce(function(gatras, item, index){
        if (index % mod === 0) {
            var newGatra = document.createElement("div");
            newGatra.classList.add("gatra");
            newGatra.innerHTML = item;
            gatras.push(newGatra)
        } else {
            gatras[gatras.length - 1].innerHTML += item;
        }
        return gatras;
    }, []);
};

var Helpers = {
    //returns a number between 0 and 1
    rand: function() { return Math.floor(Math.random() * 2);},

    nudge: function(val, inc, neg) {
        if (neg) {
            return val - inc;
        } else {
            return val + inc;
        }
    },

    //bumps a note up or down by one scale degree
    bump : function(val,num) {
        var newVal;
        if (num) {
            newVal = val + 1;
            return newVal > 5 ? 1 : newVal
        }
        newVal = val - 1;
        return newVal < 1 ? 5 : newVal
    },

    getNgempat: function(num) {
        var ngempat = num + 3;
        if (ngempat > 9) {
            ngempat = ngempat % 5;
        }
        return ngempat;
    }
}

var Instrument = {
    patternLength: {
        "pemade" : 8,
        "kantilan": 8,
        "reyong" : 8
    },

    meter : 8,

    config: [["reyong", 12, "pot"],
            ["kantilan", 10, "key"],
            ["pemade", 10, "key"],
            ["ugal", 10, "key"],
            ["penyacah", 5, "key"],
            ["jublag", 5, "key"],
            ["jegogan", 5, "key"]],

    //initial arrays of buffer indices
    parts: {
        "reyong": [[],[],[],[]],
        "pemade" : [[],[]],
        "kantilan" : [[],[]],
        "ugal" : [],
        "penyacah" : [],
        "jublag" : [],
        "jegogan" : [],
        "pokok":[],
        "neliti":[]
    },

    range: {
        "reyong": [].instrumentRange(12, 3, 5),
        "pemade" : [].instrumentRange(10, 2, 5),
        "kantilan" : [].instrumentRange(10, 2, 5),
        "ugal" : [].instrumentRange(10, 2, 5),
        "jublag" : [].instrumentRange(5, 0, 5),
        "penyacah" : [].instrumentRange(5, 0, 5),
        "jegogan" : [].instrumentRange(5, 0, 5)
    },

    getPartLength : {
        "reyong": function(){return Instrument.parts.pokok.length * Instrument.patternLength.reyong},
        "pemade" : function(){return Instrument.parts.pokok.length * Instrument.patternLength.pemade},
        "kantilan" : function(){return Instrument.parts.pokok.length * Instrument.patternLength.kantilan},
        "ugal" : function(){return Instrument.parts.neliti.length},
        "penyacah" : function(){return Instrument.parts.neliti.length},
        "jublag" : function(){return Instrument.parts.pokok.length},
        "jegogan" : function(){return Instrument.parts.jegogan.length}
    },

    resetAllParts: function() {
        this.parts = {
            "reyong": [[],[],[],[]],
            "pemade" : [[],[]],
            "kantilan" : [[],[]],
            "ugal" : [],
            "jublag" : [],
            "jegogan" : [],
            "pokok":[],
            "neliti":[],
            "penyacah" : [],
        }
    }
}
