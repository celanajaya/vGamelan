//These method deal with pattern logic at its most abstract
//Should be flexible enough to handle any type of scale/tuning system

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


//Kotekan Telu
//Kotekan Pattern in buffers
var makeTelu = 	{
    move: function(pokokTonePair) {
		var x,y,z;
		//need to determine octaves for buffers
        var pokokToBuffer = gangsaRange.indexOf(pokokTonePair[1]);
        var z = Math.abs(pokokToBuffer) < 3 ? pokokToBuffer + 5 : pokokToBuffer;
		if (pokokTonePair[0] > pokokTonePair[1]) {
			//descending
			y = z + 1;
			x = z + 2;

		} else {
			//ascending
			y = z - 1;
			x = z - 2;
		}

		var variations = [[["-",z,"-",y,z,"-",y,z],[y,"-",x,y,"-",x,y,"-"]],
                          [["-",z,"-",y,z,"-",y,z],[x,"-",x,y,"-",x,y,"-"]]];

        return variations[rand()];
    },

    //parameter 1: the previous and goal tone of the pokok
    //parameter 2: an array indicating staying pattern contour and rotation
    stay: function(pokokTonePair, stayingPattern) {
		var x,y,z;
		var stayingContours = [
			['x','y','z','x','z','y','x','z'],
			['y','x','z','y','z','x','y','z'],
			['x','y','x','z','y','x','y','z']
		];
		var contour = stayingContours[stayingPattern[0]].atRotation(stayingPattern[1]);
        var cValue = contour[contour.length - 1];
        var pokokToBuffer = gangsaRange.indexOf(pokokTonePair[1]);
        var goalTone = pokokToBuffer < 3 ? pokokToBuffer + 5 : pokokToBuffer;
        var neg = false;

        //TODO: add ability to toggle pos/neg values for nudge function, based on the direction the pattern came from
        //sets variables based on the goal tone
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
                var x = nudge(z, -2, neg)
                break;
        }
        //maps them to composite
		var composite = contour.reduce(function(e,c){
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
        return composite;
    }
}

//Basic Norot (reyong norot is in a separate file)
var makeNorot = {
    basicNorot: function(arr) {
        var x = arr[0];
        var y = (arr[0] + 1) > 5 ? 1:(arr[0] + 1);
        var z = arr[1];
        var w = (arr[1] + 1) > 5 ? 1:(arr[1] + 1);

        if (arr[0] === arr[1]) {
            return [y, x, y, x, y, x, y, x];
        }
        return [y, x, y, x, z, z, w, z];
    }
}


var makeEmpat = {
	move: function(arr, part) {
		var teluArr = makeTelu.move(arr);
		if (part === "polos") {
			return teluArr;
		} else {
			var upperComposite = [];
			var min = teluArr.reduce(function(a,b){return Math.min(a,b)});
			for (var i = 0; i < teluArr.length; i++) {
				if (teluArr[i] === min) {
					var ngempat = (teluArr[i] + 3) % 5;
					upperComposite.push(ngempat);
				} else {
					upperComposite.push(teluArr[i]);
				}
			}
			return upperComposite;
		}
	},
	stay: function(arr, part, contourType) {
		var teluArr = makeTelu.stay(arr, contourType);
		if (part === "polos") {
			return teluArr;
		} else {
			var upperComposite = [];
			var min = teluArr.reduce(function(a,b){return Math.min(a,b)});
			for (var i = 0; i < teluArr.length; i++) {
				if (teluArr[i] === min) {
					var ngempat = (teluArr[i] + 3) % 5;
					upperComposite.push(ngempat);
				} else {
					upperComposite.push(teluArr[i]);
				}
			}
			return upperComposite;
		}
	}
}

var	makeNyogCag = {
	move: function(arr, contourType) {
		var z = arr[0];
		var w, x, y;
		if (arr[0] > arr[1]) {
			y = (arr[1] - 1) % 5;
			x = (arr[1] - 2) % 5;
			w = (arr[1] - 3) % 5;
		} else {
			y = (arr[1] + 1) % 5;
			x = (arr[1] + 2) % 5;
			w = (arr[1] + 3) % 5;
		}
		var options = [[z,y,z,y,z,w,x,y], [z,y,z,x,y,w,x,y]];
		if (!contourType) contourType = 0;
		return options[contourType];
		},

	stay: function(arr, contourType) {
		var y = arr[0];
		var z = (arr[0] + 1) % 5;
		var a = (arr[0] + 2) % 5;
		var x = (arr[0] - 1) % 5;
		var w = (arr[0] - 2) % 5;
		var options = [[y,z,y,z,y,x,w,x], [y,z,a,z,y,x,w,x]];
		if (!contourType) contourType = 0;
		return options[contourType];
	}
}

function makeNeliti(arr) {
	//distance between any two pokok tones
	var dif = Math.abs(arr[0] - arr[1]) % 5;

	//bumps a note up or down by one scale degree
	function bump(val,num) {
		var newVal;
		if (num) {
			newVal = val + 1;
			return newVal > 5 ? 1:newVal
		}
		newVal = val - 1;
		return newVal < 1 ? -5:newVal
	}

	var n0;
	var n1;

	//layout contour choices based on distance between two pokok tones
	switch (dif) {
		case 0:
			//same pitch - sinusoidal around note or upper/lower neighbor
			r = rand();
			if (rand()) {
				//upper or lower neighbor
				n0 = bump(arr[0], r);
				n1 = bump(arr[1], r);
			} else {
				//sinusoid
				n0 = bump(arr[0], !r);
				n1 = bump(arr[1], r);
			}
			break;
		case 1:
			//adjacent - neighbors should surround pokok tones to create "gap fill"
			r = arr[0] > arr[1] ? 1:0;
			n0 = bump(arr[0], r);
			n1 = bump(arr[1], !r);
			break;
		case 2:
			//two apart - either spoon, or line contour
			//bumps upper neighbors for descending contours, lower neighbors for ascending
			r = arr[0] > arr[1] ? 1:0;

			if (rand()) {
				//line (all uppers or lowers)
				n0 = bump(arr[0], r);
				n1 = bump(arr[1], r);
			} else {
				//spoon (inner note, 'lower of upper' and vice versa)
				n0 = bump(arr[0], !r);
				n1 = bump(arr[1], r);
			}

			break;
		case 3:
		case 4:
			//fill gaps for wide distances
			var r = arr[0] > arr[1] ? 0:1;
			n0 = bump(arr[0], r);
			n1 = bump(arr[1], r);
			break;
	}
	return [n0, arr[0], n1, arr[1]];
}

function rand() { return Math.floor(Math.random() * 2);}
function nudge(val, inc, neg) {
    if (neg) {
        return val - inc;
    } else {
        return val + inc;
    }
}
