var Gamelan = {
    //the number of elaboration tones per pokok tone
    patternLength: {
        "pemade" : 8,
        "kantilan": 8,
        "reyong" : 8
    },

    patternType: {
        "pemade" : function() {return pemadePatternType},
        "kantilan" : function() {return kantilanPatternType},
        "reyong" : function() {return reyongPatternType}
    },


    meter : 8,

    //the instrument names, ranges, type of key (used when building UI)
    config: [["reyong", 12, "pot"],
        ["kantilan", 10, "key"],
        ["pemade", 10, "key"],
        ["ugal", 10, "key"],
        ["penyacah", 5, "key"],
        ["jublag", 5, "key"],
        ["jegogan", 5, "key"]
    ],

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

    //an array which shows the range of an given instrument in scale degrees
    range: {
        "reyong": [].instrumentRange(12, 3, 5),
        "pemade" : [].instrumentRange(10, 2, 5),
        "kantilan" : [].instrumentRange(10, 2, 5),
        "ugal" : [].instrumentRange(10, 2, 5),
        "jublag" : [].instrumentRange(5, 0, 5),
        "penyacah" : [].instrumentRange(5, 0, 5),
        "jegogan" : [].instrumentRange(5, 0, 5)
    },

    interval: {
        "reyong": function(){return"16n"},
        "pemade" : function(){
            if (pemadePatternType == kMalPal) {
                return "8n";
            }
            return"16n"
        },
        "kantilan" : function(){
            if (kantilanPatternType == kMalPal) {
                return "8n";
            }
            return"16n"
        },
        "ugal" : function(){return"4n"},
        "jublag" : function(){return"2n"},
        "penyacah" : function(){return"4n"},
        "jegogan" : function(){return"1n"}
    },

    offset: {
        "reyong": "0:0:0",
        "pemade": "0:0:0",
        "kantilan": "0:0:0",
        "ugal": "0:0:3",
        "jublag":"0:1:3",
        "penyacah": "0:0:3",
        "jegogan": "0:3:3"
    },

    //returns the total numbers notes for that part
    getPartLength : {
        "reyong": function(){return Gamelan.parts.pokok.length * Gamelan.patternLength.reyong},
        "pemade" : function(){return Gamelan.parts.pokok.length * Gamelan.patternLength.pemade},
        "kantilan" : function(){return Gamelan.parts.pokok.length * Gamelan.patternLength.kantilan},
        "ugal" : function(){return Gamelan.parts.neliti.length},
        "penyacah" : function(){return Gamelan.parts.neliti.length},
        "jublag" : function(){return Gamelan.parts.pokok.length},
        "jegogan" : function(){return Gamelan.parts.jegogan.length}
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
            "penyacah" : []
        }
    }
}