/**
 * Created by Pete on 9/11/16.
 */
var makeReyongNorot = {
    "move" : function(pokokPair) {
        pokokPair = pokokPair.map(function(i){return i - 1});
        var prevStaying = this.patternBank[pokokPair[0]].map(Helpers.getStaying);
        var nextMoving = this.patternBank[pokokPair[1]].map(Helpers.getMoving);
        var d = Helpers.deepConcat(prevStaying, nextMoving);
        return d
    },

    "stay" : function(pokokPair) {
        pokokPair = pokokPair.map(function(i){return i - 1});
        var prevStaying = this.patternBank[pokokPair[0]].map(Helpers.getStaying);
        var nextStaying = this.patternBank[pokokPair[1]].map(Helpers.getStaying);
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
            {"moving": [6, 7, 8, "-"], "staying": [10, 9, 10, 9]},
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
    ]

}

var improv = {
    "double": function(arr) {

    },
    "subtract": function(arr) {

    },
    "kilit" : function(arr) {

    },
}

var cadentialPatterns = {
    "2-beat" : function(){},
    "4-beat" : function(){},
    "dongSpecial": function(){},
    "dangSpecial": function(){}
}
