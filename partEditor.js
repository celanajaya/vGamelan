var ElaborationSettings = {
    'build': function(instrumentName){
        this['mainNode'] = document.createElement('div');
        this['mainNode'].className = 'static-pattern-selector'
        this['mainNode'].innerHTML = "Elaboration Settings";
        this['mainNode'].id = instrumentName + "-elaboration-settings-main-node";
        var dropdownContainer = document.createElement("dropdown-container");
        this['mainNode'].appendChild(dropdownContainer);
        addDropDownContentForInstrument(instrumentName, dropdownContainer);
        createPatternSelector(this['mainNode']);
        return this;
    },
    'show':function(){
        this.mainNode.classList.add('show');
        this.isShowing = true;
        document.getElementById('settings-tab-content').appendChild(this['mainNode']);
    },
    'hide':function(){
        this.mainNode.classList.remove('show');
        this.isShowing = false;
        this['mainNode'].parentNode.removeChild(this['mainNode']);
    }
};

function createPatternSelector(parent){
    var table = document.createElement('table');
    var patternBank = [['x','y','z','x','z','y','x','z'],
                       ['y','x','z','y','z','x','y','z'],
                       ['x','y','x','z','y','x','y','z']].map(function(r){
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
    for (var y = 0; y < 3; y++) {
        var row = document.createElement('tr');
        for (var x = 0; x < 8; x++) {
            var d = document.createElement('td');
            var svg = d3.select(d).append('svg').attr('height', 30).attr('width', 80);
            svg.attr("id",  x.toString() + "-" + y.toString()+ "-static-svg");
            svg.on('click', selectPattern);
            for (var pY = 0; pY < 3; pY++) {
                for (var pX = 0; pX < 8; pX++){
                    var boxColor = patternBank[pY][pX] === pY ? 'rgb(0,0,0)' : 'rgb(220,220,220)';
                    svg.append('rect')
                        .attr('width', 10)
                        .attr('height', 10)
                        .attr('fill', boxColor)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 0.05)
                        .attr('x',10 * pX)
                        .attr('y', 10 * pY)
                }
            }
            row.appendChild(d);
        }
        table.appendChild(row);
    }
    parent.appendChild(table);
}

function selectPattern(){
    var patternID = d3.select(this).attr('id');
    var parsedID = patternID.split("-");

    teluStayingPattern = [parsedID[0],parsedID[1]];
    empatStayingPattern = [parsedID[0],parsedID[1]];
}



var PartEditor = {
    'build': function(instrumentName){
        this['mainNode'] = document.createElement('div');
        this['mainNode'].className = 'part-editor'
        this['mainNode'].innerHTML = "Part Editor";
        this['mainNode'].id = instrumentName + "-part-editor-main-node";
        return this;
    },
    'show':function(){
        this.mainNode.classList.add('show');
        this.isShowing = true;
        document.getElementById('settings-tab-content').appendChild(this['mainNode']);
    },
    'hide':function(){
        this.mainNode.classList.remove('show');
        this.isShowing = false;
        this['mainNode'].parentNode.removeChild(this['mainNode']);
    }
};

var AdvancedSettings = {
    'build': function(instrumentName){
        this['mainNode'] = document.createElement('div');
        this['mainNode'].className = 'part-settings'
        this['mainNode'].innerHTML = "Advanced Settings";
        this['mainNode'].id = instrumentName + "-advanced-settings-main-node";
        return this;
    },
    'show':function(){
        this.mainNode.classList.add('show');
        this.isShowing = true;
        document.getElementById('settings-tab-content').appendChild(this['mainNode']);
    },
    'hide':function(){
        this.mainNode.classList.remove('show');
        this.isShowing = false;
        this['mainNode'].parentNode.removeChild(this);
    }
};

var InstrumentInfo = {
    'build': function(instrumentName){
        this['mainNode'] = document.createElement('div');
        this['mainNode'].className = 'instrument-info'
        this['mainNode'].innerHTML = "Instrument Info";
        this['mainNode'].id = instrumentName + "-instrument-info-main-node";
        return this;
    },
    'show':function(){
        this.mainNode.classList.add('show');
        this.isShowing = true;
        document.getElementById('settings-tab-content').appendChild(this['mainNode']);
    },
    'hide':function(){
        this.mainNode.classList.remove('show');
        this.isShowing = false;
        this['mainNode'].parentNode.removeChild(this['mainNode']);
    }
};

function hideAllEditorTabs() {
    var tabs = [InstrumentInfo, PartEditor, ElaborationSettings, AdvancedSettings];
    tabs.forEach(function(tab){
        console.log(tab);
        if (tab.mainNode != null) {
            tab.hide();
        }
    })
}

