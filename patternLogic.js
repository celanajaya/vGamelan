//These method deal with pattern logic at its most abstract
//Should be flexible enough to handle any type of scale/tuning system

//Kotekan Telu
var makeTelu = 	{
    move: function(pokokBuffers) {
		var x,y,z;
		//need to determine octaves for buffers
        var z = pokokBuffers[1];
		if (pokokBuffers[0] > pokokBuffers[1]) {
            // console.log("descending");
            this["lastMove"] = "descending";
			//descending
			y = z + 1;
			x = z + 2;

		} else {
			//ascending
            // console.log("ascending");
            this["lastMove"] = "descending";
            y = z - 1;
			x = z - 2;
		}

		var variations = [[["-",z,"-",y,z,"-",y,z],[y,"-",x,y,"-",x,y,"-"]],
                          [["-",z,"-",y,z,"-",y,z],[x,"-",x,y,"-",x,y,"-"]]];

        return variations[rand()];
    },

    //parameter 1: the previous and goal tone of the pokok
    //parameter 2: an array indicating staying pattern contour and rotation
    stay: function(pokokBuffers, stayingPattern) {
        console.log("static");
		var x,y,z;
		var stayingContours = [
			['x','y','z','x','z','y','x','z'],
			['y','x','z','y','z','x','y','z'],
			['x','y','x','z','y','x','y','z']
		];
		var contour = stayingContours[stayingPattern[0]].atRotation(stayingPattern[1]);
        var cValue = contour[contour.length - 1];
        var goalTone = pokokBuffers[1];
        //choose the three elaboration tones based whether we arrived at that note from above or below
        var neg = this.lastMove === "descending";

        //sets telu notes based on contour
        switch (cValue) {
            case "x":
                var x = goalTone;
                var y = nudge(x, 1, neg);
                var z = nudge(x, 2, neg);
                break;
            case "y":
                var y = goalTone;
                var x = nudge(y, -1, neg);
                var z = nudge(y, +1, neg);
                break;
            case "z":
                var z = goalTone;
                var y = nudge(z, -1, neg);
                var x = nudge(z, -2, neg);
                break;
        }
        //maps them to composite
		var kotekan = contour.reduce(function(e,c){
            switch(c) {
                case "x":
                    e[1].push(x);
                    e[0].push("-");
                    break;
                case "y":
                    e[1].push(y);
                    e[0].push(y);
                    break;
                case "z":
                    e[1].push("-");
                    e[0].push(z);
                    break;
            }
            return e;
        },[[],[]]);
        return kotekan;
    }
}

//Basic Norot (reyong norot is in a separate file)
var makeNorot = {
    basicNorot: function(arr) {
        var x = arr[0];
        var y = (arr[0] + 1);
        var z = arr[1];
        var w = (arr[1] + 1);

		var composite = arr[0] === arr[1] ? [y, x, y, x, y, x, y, x] : [y, x, y, x, z, z, w, z];

		//turn elaboration in to polos/sangsih
		if (Tone.Transport.bpm.value > 90) {
			if (arr[0] === arr[1]) {
				return [composite.map(this.fastStayingPolos), composite.map(this.fastStayingSangsih)];
			}
			return [composite.map(this.fastMovingSangsih), composite.map(this.fastMovingPolos)];
		} else {
			return [composite, composite.map(Helpers.getNgempat)];
		}
    },

    //helpers
    //TODO: refactor indices to account for multiple elaboration pattern lengths
    fastMovingPolos : function(value, index) {
        switch (index) {
            case 1:
            case 3:
            case 4:
            case 5:
            case 7:
                return value;
            default:
                return "-";
        }
    },

    fastStayingPolos: function(value, index) {
        if (index % 2 != 0) {
            return value;
        } else {
            return "-"
        }
    },

    fastMovingSangsih: function(value, index) {
        switch (index) {
            case 0:
            case 2:
            case 4:
            case 5:
            case 6:
                return value;
            default:
                return "-";
        }
    },

    fastStayingSangsih: function(value, index) {
        if (index % 2 === 0) {
            return value;
        } else {
            return "-";
        }
    }
}

var makeEmpat = {
	move: function(arr) {
		// var teluArr = makeTelu.move(arr);
		// if (part === "polos") {
		// 	return teluArr;
		// } else {
		// 	var upperComposite = [];
		// 	var min = teluArr.reduce(function(a,b){return Math.min(a,b)});
		// 	for (var i = 0; i < teluArr.length; i++) {
		// 		if (teluArr[i] === min) {
		// 			var ngempat = (teluArr[i] + 3) % 5;
		// 			upperComposite.push(ngempat);
		// 		} else {
		// 			upperComposite.push(teluArr[i]);
		// 		}
		// 	}
		// 	return upperComposite;
		// }
	},
	stay: function(arr, contourType) {
		// var teluArr = makeTelu.stay(arr, contourType);
		// if (part === "polos") {
		// 	return teluArr;
		// } else {
		// 	var upperComposite = [];
		// 	var min = teluArr.reduce(function(a,b){return Math.min(a,b)});
		// 	for (var i = 0; i < teluArr.length; i++) {
		// 		if (teluArr[i] === min) {
		// 			var ngempat = (teluArr[i] + 3) % 5;
		// 			upperComposite.push(ngempat);
		// 		} else {
		// 			upperComposite.push(teluArr[i]);
		// 		}
		// 	}
		// 	return upperComposite;
		// }
	}
}

var	makeNyogCag = {
	move: function(arr, contourType) {
		var z = arr[1];
		var w, x, y;
		if (arr[0] > arr[1]) {
            console.log("descending");
			y = (arr[1] + 1);
			x = (arr[1] + 2);
			w = (arr[1] + 3);
		} else {
            console.log("ascending");
            y = (arr[1] - 1);
			x = (arr[1] - 2);
			w = (arr[1] - 3);
		}
		var options = [[y,z,y,z,w,x,y,z],
                       [y,z,x,y,w,x,y,z]];
		return this.split(options[contourType]);
    },

	stay: function(arr, contourType) {
        console.log("staying");
		var y = arr[0];
		var z = (arr[0] + 1);
		var a = (arr[0] + 2);
		var x = (arr[0] - 1);
		var w = (arr[0] - 2);
		var options = [[z,y,z,y,x,w,x,y],
                       [z,a,z,y,x,w,x,y]];
        return this.split(options[contourType]);
	},

	split: function(composite) {
        return composite.reduce(function(k, note, i){
            if (i % 2 == 0) {
                k[1].push(note);
                k[0].push("-");
            } else {
                k[1].push("-");
                k[0].push(note);
            }
            return k
        }, [[],[]])
    }
}
