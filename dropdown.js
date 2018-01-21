//Dropdown Creator
var DropDownTypes = {
    "pattern" : "DROPDOWN_LIST_TYPE_PATTERN",
    "contour" : "DROPDOWN_LIST_TYPE_CONTOUR"
}

function dropDownForInstrument(instrumentName, type) {
    var startingText;
    var list;
    var dropdown;

    if (type === DropDownTypes.pattern) {
        switch (instrumentName) {
            case "reyong":
                list = patternTypes.slice(0, 2);
                startingText = reyongPatternType;
                break;
            case "kantilan":
                list = patternTypes.slice(1);
                startingText = kantilanPatternType;
                break;
            case "pemade":
                list = patternTypes.slice(1);
                startingText = pemadePatternType;
                break;
        }

        dropdown = createDropDown(startingText + ' ', instrumentName);
        addItemsToDropdown(list, dropdown, instrumentName);

    } else {

        dropdown = createDropDown("contour ", instrumentName);
        createPatternSelector(dropdown.lastChild, instrumentName);
    }

    return dropdown;
}

function createDropDown(defaultTitle, instrumentName) {
    var dropDown = document.createElement("div");
    dropDown.className = "dropdown";
    dropDown.textContent = defaultTitle;
    var caret = createCaret();
    dropDown.appendChild(caret);

    var dropDownContent = document.createElement("div");
    dropDownContent.className = "dropdown-content";
    dropDownContent.id = dropDownContent.className + "-" + instrumentName;
    dropDown.appendChild(dropDownContent);
    dropDown.addEventListener("click", function () {
        toggleClass(dropDownContent, "show");
        toggleClass(caret, "fa-caret-down");
        toggleClass(caret, "fa-caret-left");
    });
    return dropDown;
}

function addItemsToDropdown(itemList, dropdown, instrumentName) {
    var dropDownContent = dropdown.lastChild;
    itemList.forEach(function(pType) {
        var menuItem = document.createElement("p");
        menuItem.innerHTML = pType;
        menuItem.addEventListener("click", function (event) {
            var dropDownTextNode = event.target.parentElement.parentElement.childNodes[0];
            dropDownTextNode.data = event.target.textContent;
            switch (instrumentName) {
                case"reyong":
                    reyongPatternType = event.target.textContent;
                    setReyongPart();
                    break;
                case"kantilan":
                    kantilanPatternType = event.target.textContent;
                    setGangsaPart("kantilan");
                    break;
                case "pemade":
                    pemadePatternType = event.target.textContent;
                    setGangsaPart("pemade");
                    break;
            }
            //update SVGs
            showPattern(instrumentName, Gamelan.parts[instrumentName].reduce(toConcatedArrays),
                Gamelan.range[instrumentName].length,
                Gamelan.getPartLength[instrumentName]());
        });
        dropDownContent.appendChild(menuItem);
    });

}

function createPatternSelector(parent, instrumentName) {
    var table = document.createElement('table');
    var patternBank = Gamelan.staticPatternsForPatternType(Gamelan.patternType[instrumentName]()).map(function(r){
        return r.map(function(l){
            switch(l){
                case 'z':
                    return 0;
                case 'y':
                    return 1;
                case 'x':
                    return 2;
            }
        })
    });
    for (var y = 0; y < 8; y++) {
        var row = document.createElement('tr');
        for (var x = 0; x < 3; x++) {
            var d = document.createElement('td');
            var svg = d3.select(d).append('svg')
                .attr('viewBox', '0 0 5 15')
                .attr('height', 5)
                .attr('width', 15);

            svg.attr("id",  x.toString() + "-" + y.toString()+ "-static-svg");
            svg.on('click', selectPattern(instrumentName));

            //for drawing each individual svg with the available static patterns
            for (var pY = 0; pY < 3; pY++) {
                for (var pX = 0; pX < 8; pX++){
                    //LOL....wtf
                    var boxColor = patternBank[x].atRotation(y)[pX] === pY ? 'rgb(237,51,207)' : 'rgb(220,220,220)';
                    svg.append('rect')
                        .attr('viewBox', '' + pX + '' + pY + '1 1')
                        .attr('width', 1)
                        .attr('height', 1)
                        .attr('fill', boxColor)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 0.05)
                        .attr('x', pX)
                        .attr('y', pY)
                }
            }
            row.appendChild(d);
        }
        table.appendChild(row);
    }
    parent.appendChild(table);
}

function selectPattern(instrumentName) {
    return function () {
        var patternID = d3.select(this).attr('id');
        var parsedID = [parseInt(patternID.split("-")[1]), parseInt(patternID.split("-")[0])];
        //redraw SVG for instrument;
        if (instrumentName === "pemade" || instrumentName === "kantilan") {
            switch (Gamelan.patternType[instrumentName]()) {
                case kTelu:
                    teluStayingPattern = parsedID;
                    break;
                case kEmpat:
                    empatStayingPattern = parsedID;
                    break;
            }
            setGangsaPart(instrumentName);
        } else if (instrumentName === "reyong") {
            empatStayingPattern = parsedID;
            setReyongPart();
        }

        var part = Gamelan.parts[instrumentName].reduce(toConcatedArrays, []);
        var rangeHeight = Gamelan.range[instrumentName].length;
        var partLength = Gamelan.getPartLength[instrumentName]();
        showPattern(instrumentName, part, rangeHeight, partLength);
    }
}

function createCaret(){
    var caret = document.createElement("i");
    caret.className = "fa-caret-left";
    return caret;
}