/**
 * Created by Pete on 9/11/16.
 */
var makeReyongNorot = {
    "move" : function(pokokPair) {
        if (pokokPair[1] === 2 || pokokPair[1] === 5) {
            if (pokokPair[1] ===2) {
                return this.cadentialPatterns.dongSpecial;
            } else {
                return this.cadentialPatterns.dangSpecial;
            }
        }
        pokokPair = pokokPair.map(function(i){return i - 1});
        var prevStaying = Improv.randomize(this.patternBank[pokokPair[0]].map(Helpers.getStaying));
        var nextMoving = Improv.randomize(this.patternBank[pokokPair[1]].map(Helpers.getMoving));
        var d = Helpers.deepConcat(prevStaying, nextMoving);
        return d
    },

    "stay" : function(pokokPair) {
        pokokPair = pokokPair.map(function(i){return i - 1});
        var prevStaying = Improv.randomize(this.patternBank[pokokPair[0]].map(Helpers.getStaying));
        var nextStaying = Improv.randomize(this.patternBank[pokokPair[1]].map(Helpers.getStaying));
        var d = Helpers.deepConcat(prevStaying, nextStaying);
        return d
    },

    "patternBank" : [
        [{"moving": [2, 1, 2, "-"], "staying": [2, 1, 2, "-"]},
            {"moving": [3, 3, 4, 3], "staying": [4, 3, 4, 3]},
            {"moving": [7, 6, 7, "-"], "staying": [7, 6, 7, "-"]},
            {"moving": [8, 8, 9, 8], "staying": [9, 8, 9, 8]}],
        [{"moving": [1, 2, 3, "-"], "staying": [3, 2, 3, "-"]},
            {"moving": [4, 4, 5, 4], "staying": [5, 4, 5, 4]},
            {"moving": [6, 7, 8, "-"], "staying": [8, 7, 8, "-"]},
            {"moving": [9, 9, 10, 9], "staying": [10, 9, 10, 9]}],
        [{"moving": [0, 0, 1, 0], "staying": [1, 0, 1, 0]},
            {"moving": [5, 5, 3, 5], "staying": [3, 5, 3, 5]},
            {"moving": [6, 7, 6, "-"], "staying": [6, 7, 6, "-"]},
            {"moving": [10, 10, 11, 10], "staying": [11, 10, 11, 10]}],
        [{"moving": [1, 1, 2, 1], "staying": [2, 1, 2, 1]},
            {"moving": [5, 4, 5, "-"], "staying": [5, 4, 5, "-"]},
            {"moving": [6, 6, 7, 6], "staying": [7, 6, 7, 6]},
            {"moving": [11, 11, 10, 11], "staying": [10, 11, 10, 11]}],
        [{"moving": [2, 2, 0, 2], "staying": [0, 2, 0, 2]},
            {"moving": [5, 5, 3, 5], "staying": [3, 5, 3, 5]},
            {"moving": [7, 7, 6, 7], "staying": [6, 7, 6, 7]},
            {"moving": [8, 9, 8, "-"], "staying": [8, 9, 8, "-"]}]
    ],

    cadentialPatterns : {
        "2-beat" : function(){},
        "4-beat" : function(){},
        "dongSpecial": [[2,1,2,"-",1,2,3,"-"],[4,3,"-",3,4,5,"-",4],[7,6,7,"-",6,7,8,"-"],[9,8,"-",8,9,10,"-",9]],
        "dangSpecial": [[2,1,2,"-",1,2,"-",2],[4,3,"-",3,"-",4,3,5],[7,6,7,"-",6,7,"-",7],[9,8,"-",8,"-",9,8,10]]
    }
}

var Improv = {
    //run the array through a random combination of the other functions
    "randomize":function(arr){
        // var options = [this.double(arr), this.subtract(arr), arr];
        // return options[Helpers.rand(options.length)];
        return arr;
    },

    "double": function(arr) {
        return arr.map(function(innerArr){
            var randInt = Helpers.rand(4);
            var val = innerArr[randInt];
            var count = 0;
            return innerArr.map(function(b, i){
                if (b != val && count < 1) {
                    count++;
                    return b;
                } else {
                    return val;
                }
            });
        })
    },

    //one or two times per pattern, take a random index and put a rest there
    "subtract": function(arr) {
        return arr.map(function(innerArr){
            var count = Helpers.rand(2) + 1;
            while (count > 0) {
                var r = Helpers.rand(4);
                innerArr[r] = "-";
                count--
            }
            return innerArr;
        });
    },

}


