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
        if (tab.mainNode != null) {
            tab.hide();
        }
    })
}

