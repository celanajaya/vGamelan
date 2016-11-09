function makeNeliti(arr) {
    //distance between any two Instrument.parts.pokok tones
    var dif = Math.abs(arr[0] - arr[1]) % 5;
    var n0;
    var n1;

    //layout contour choices based on distance between two Instrument.parts.pokok tones
    switch (dif) {
        case 0:
            //same pitch - sinusoidal around note or upper/lower neighbor
            r = Helpers.rand(2);
            if (Helpers.rand(2)) {
                //upper or lower neighbor
                n0 = Helpers.bump(arr[0], r);
                n1 = Helpers.bump(arr[1], r);
            } else {
                //sinusoid
                n0 = Helpers.bump(arr[0], !r);
                n1 = Helpers.bump(arr[1], r);
            }
            break;
        case 1:
            //adjacent - neighbors should surround Instrument.parts.pokok tones to create "gap fill"
            r = arr[0] > arr[1] ? 1:0;
            n0 = Helpers.bump(arr[0], r);
            n1 = Helpers.bump(arr[1], !r);
            break;
        case 2:
            //two apart - either spoon, or line contour
            //bumps upper neighbors for descending contours, lower neighbors for ascending
            r = arr[0] > arr[1] ? 1:0;

            if (Helpers.rand(2)) {
                //line (all uppers or lowers)
                n0 = Helpers.bump(arr[0], r);
                n1 = Helpers.bump(arr[1], r);
            } else {
                //spoon (inner note, 'lower of upper' and vice versa)
                n0 = Helpers.bump(arr[0], !r);
                n1 = Helpers.bump(arr[1], r);
            }

            break;
        case 3:
        case 4:
            //fill gaps for wide distances
            var r = arr[0] > arr[1] ? 0:1;
            n0 = Helpers.bump(arr[0], r);
            n1 = Helpers.bump(arr[1], r);
            break;
    }
    var initialTones = [n0, arr[0], n1, arr[1]];
    return setUgalBuffers(initialTones);

    //helper function
    function setUgalBuffers(tones){
        if (tones[1] == 5 && tones[3] == 1) {
            return [2,3,5,4];
        }
        for (var i = 0; i < tones.length; i++) {
            var cur = tones[i];
            var prev = i != 0 ? tones[i - 1] : tones[tones.length- 1];
            var prevPrev;
            if ((i - 1) != 0) {
                prevPrev = tones[i - 2];
            }
            if (cur === 1) {
                tones[i] = Gamelan.range["ugal"].indexOf(cur);

                if (prev === 5) {

                    if (prevPrev && prevPrev === 4) {

                        tones[i - 2] = Gamelan.range.ugal.indexOf(prevPrev);
                    }
                    if (i % 2 == 0) {
                        tones[i - 1] = Gamelan.range.ugal.indexOf(2) + 5;
                    } else {
                        tones[i - 1] = Gamelan.range.ugal.indexOf(prev);
                    }
                }
            } else {
                tones[i] = Gamelan.range.ugal.indexOf(cur) + 5;
            }
        }
        var neg = true;
        //check for repeated tones between the 2nd and 3rd notes
        while (tones[1] == tones[2]) {
            neg = !neg;
            tones[2] = Helpers.nudge(tones[3], -1, neg);
        }
        return tones;
    }
}