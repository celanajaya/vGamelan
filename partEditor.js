var StaticPatternSelector= {
    'build': function(){
        this['mainNode'] = document.createElement('div');
        this['mainNode'].className = 'static-pattern-selector'
        this['mainNode'].innerHTML = "Static Pattern Selector";
    },
    'show':function(){
        this.mainNode.classList.add('show');
        this.isShowing = true;
        document.getElementById('tab-content').appendChild(this['mainNode']);
    },
    'hide':function(){
        this.mainNode.classList.remove('show');
        this.isShowing = false;
        document.getElementById('tab-content').removeChild(this['mainNode']);
    }
};

var PartEditor = {
    'build': function(){
        this['mainNode'] = document.createElement('div');
        this['mainNode'].className = 'part-editor'
        this['mainNode'].innerHTML = "Part Editor";
    },
    'show':function(){
        this.mainNode.classList.add('show');
        this.isShowing = true;
        document.getElementById('tab-content').appendChild(this['mainNode']);
    },
    'hide':function(){
        this.mainNode.classList.remove('show');
        this.isShowing = false;
        document.getElementById('tab-content').removeChild(this['mainNode']);
    }
};

var PartSettings = {
    'build': function(){
        this['mainNode'] = document.createElement('div');
        this['mainNode'].className = 'part-settings'
        this['mainNode'].innerHTML = "Part Settings";
    },
    'show':function(){
        this.mainNode.classList.add('show');
        this.isShowing = true;
        document.getElementById('tab-content').appendChild(this['mainNode']);
    },
    'hide':function(){
        this.mainNode.classList.remove('show');
        this.isShowing = false;
        document.getElementById('tab-content').removeChild(this['mainNode']);
    }
};

var InstrumentInfo = {
    'build': function(){
        this['mainNode'] = document.createElement('div');
        this['mainNode'].className = 'instrument-info'
        this['mainNode'].innerHTML = "Instrument Info";
    },
    'show':function(){
        this.mainNode.classList.add('show');
        this.isShowing = true;
        document.getElementById('tab-content').appendChild(this['mainNode']);
    },
    'hide':function(){
        this.mainNode.classList.remove('show');
        this.isShowing = false;
        document.getElementById('tab-content').removeChild(this['mainNode']);
    }
};

