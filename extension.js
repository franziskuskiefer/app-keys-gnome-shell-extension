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
		// TODO: could be done nice
		this.disable();
		this.enable();
	},

	enable: function(){
		let enableKP = this.settings.get_boolean(config.SETTINGS_USE_KEYPAD);
		let enableNUM = this.settings.get_boolean(config.SETTINGS_USE_NUMS);
		let enableNW = this.settings.get_boolean(config.SETTINGS_USE_NW);
		let enableNKP = this.settings.get_boolean(config.SETTINGS_USE_NKP);
	
		for(var i=1; i<10; i++) {
			if (enableNUM) {
				global.display.add_keybinding('app-key'+i, this.settings, Meta.KeyBindingFlags.NONE, this.clickClosure(i-1));
				Main.wm.setCustomKeybindingHandler('app-key'+i, Shell.KeyBindingMode.NORMAL, this.clickClosure(i-1));
			}
	
			if (enableNW) {
				global.display.add_keybinding('app-key-shift'+i, this.settings, Meta.KeyBindingFlags.NONE, this.clickClosure(i-1, {newwindow: true}));
				Main.wm.setCustomKeybindingHandler('app-key-shift'+i, Shell.KeyBindingMode.NORMAL, this.clickClosure(i-1, {newwindow: true}));
			}

			if (enableNKP) {
				global.display.add_keybinding('app-key-shift-kp'+i, this.settings, Meta.KeyBindingFlags.NONE, this.clickClosure(i-1, {newwindow: true}));
				Main.wm.setCustomKeybindingHandler('app-key-shift-kp'+i, Shell.KeyBindingMode.NORMAL, this.clickClosure(i-1, {newwindow: true}));
		    }

			if (enableKP) {
				global.display.add_keybinding('app-key-kp'+i, this.settings, Meta.KeyBindingFlags.NONE, this.clickClosure(i-1));
				Main.wm.setCustomKeybindingHandler('app-key-kp'+i, Shell.KeyBindingMode.NORMAL, this.clickClosure(i-1));
			}
		}
	},
	
	disable: function(){
		for(var i=1; i<10; i++) {
		    global.display.remove_keybinding('app-key'+i);
		    global.display.remove_keybinding('app-key-shift'+i);
		    global.display.remove_keybinding('app-key-kp'+i);
		    global.display.remove_keybinding('app-key-shift-kp'+i);
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
