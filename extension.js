//Import the Main and Meta object
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Lang = imports.lang;

// Import shell
const Shell = imports.gi.Shell;
// Import Dash also
const Dash = Main.overview._dash;


// Import the convenience.js (Used for loading settings schemas)
const Self = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Self.imports.convenience;

// Import config
const config = Self.imports.config;

function AppKeys() {
	this.init();
}

AppKeys.prototype = {
	Name: 'AppKeys',

	init: function() {
		this.settings = Convenience.getSettings();
	
		this.settings.connect('changed::' + config.SETTINGS_USE_KEYPAD, Lang.bind(this, this.toggleKeys));
		this.settings.connect('changed::' + config.SETTINGS_USE_NUMS, Lang.bind(this, this.toggleKeys));
		this.settings.connect('changed::' + config.SETTINGS_USE_NW, Lang.bind(this, this.toggleKeys));
		this.settings.connect('changed::' + config.SETTINGS_USE_NKP, Lang.bind(this, this.toggleKeys));
	},

	//This is a javascript-closure which will return the event handler
	//for each hotkey with it's id. (id=1 For <Super>+1 etc)
	clickClosure: function(id, options){
		options = options || {};
		return function(){
		    Dash._redisplay(); // Re-order apps in dash before loading

		    // Get the current actors from Dash, and get apps from the actors
		    // This part is copied from the dash source (/usr/share/gnomes-shell/js/ui/dash.js)
		    let children = Dash._box.get_children().filter(function(actor) {
		            return actor.child &&
		                   actor.child._delegate &&
		                   actor.child._delegate.app;
		        });
		    let apps = children.map(function(actor) {
		            return actor.child._delegate.app;
		        });


		    if(typeof(apps[id]) !== 'undefined') { // This is just to ignore problems when there is no such app (yet).
		        if (options.newwindow)
		            apps[id].open_new_window(-1);
		        else
		            apps[id].activate();
		    }
		}
	},

	toggleKeys: function() {
		// TODO: could be done nicer
		this.disable();
		this.enable();
	},

	_addKeybindings: function(name, handler) {
		if (Main.wm.addKeybinding)
		   Main.wm.addKeybinding(name, this.settings, Meta.KeyBindingFlags.NONE, Shell.KeyBindingMode.NORMAL | Shell.KeyBindingMode.OVERVIEW, handler);
		else
		   global.display.add_keybinding(name, this.settings, Meta.KeyBindingFlags.NONE, handler);
	},
	
	_removeKeybindings: function(name) {
		if (Main.wm.removeKeybinding)
        	Main.wm.removeKeybinding(name);
		else
		   global.display.remove_keybinding(name);
	},

	enable: function(){
		let enableKP = this.settings.get_boolean(config.SETTINGS_USE_KEYPAD);
		let enableNUM = this.settings.get_boolean(config.SETTINGS_USE_NUMS);
		let enableNW = this.settings.get_boolean(config.SETTINGS_USE_NW);
		let enableNKP = this.settings.get_boolean(config.SETTINGS_USE_NKP);
	
		for(var i=0; i<10; i++) {
			var j = i-1;
			if (i == 0) j = 9;
			if (enableNUM)
				this._addKeybindings('app-key'+i, this.clickClosure(j));
	
			if (enableNW)
				this._addKeybindings('app-key-shift'+i, this.clickClosure(j, {newwindow: true}));

			if (enableNKP)
				this._addKeybindings('app-key-shift-kp'+i, this.clickClosure(j, {newwindow: true}));

			if (enableKP)
				this._addKeybindings('app-key-kp'+i, this.clickClosure(j));
		}
	},
	
	disable: function(){
		for(var i=0; i<10; i++) {
		    this._removeKeybindings('app-key'+i);
		    this._removeKeybindings('app-key-shift'+i);
		    this._removeKeybindings('app-key-kp'+i);
		    this._removeKeybindings('app-key-shift-kp'+i);
		}
	}

};

let app;

// create app keys app
function init() {
	app = new AppKeys();
}

function enable() {
	app.enable();
}

function disable() {
    app.disable();
}
