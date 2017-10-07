//Dropdown Creator
var DropDownTypes = {
    "pattern" : "DROPDOWN_LIST_TYPE_PATTERN",
    "contour" : "DROPDOWN_LIST_TYPE_CONTOUR"
}

function dropDownForInstrument(instrumentName, type) {
    var startingText;
    var list;

    if (type === DropDownTypes.pattern) {
        switch (instrumentName) {
            case "reyong":
                list = patternTypes.slice(0, -3);
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

        var dropdown = createDropDown(startingText, instrumentName);
        addItemsToDropdown(list, dropdown, instrumentName);
        return dropdown;
    } else {
        var dropdown2 = createDropDown("Contour", instrumentName);
        createPatternSelector(dropdown2.lastChild, instrumentName);
        return dropdown2;
    }

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
        toggleClass(caret, "fa-caret-down")
        toggleClass(caret, "fa-caret-left")
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

function createCaret(){
    var caret = document.createElement("i");
    caret.className = "fa-caret-left";
    return caret;
}