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

var helpers = {
    rand: function() { return Math.floor(Math.random() * 2);},

    nudge: function(val, inc, neg) {
        if (neg) {
            return val - inc;
        } else {
            return val + inc;
        }
    }
}
