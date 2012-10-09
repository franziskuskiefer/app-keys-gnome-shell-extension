//Import the Main and Meta object
const Main = imports.ui.main;
const Meta = imports.gi.Meta;

//Import Dash also
const Dash = Main.overview._dash;

//Import the convenience.js (Used for loading settings schemas)
const Self = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Self.imports.convenience;

//Load the keybinging settings on loading
function init() {
    settings = Convenience.getSettings();
}

//This is a javascript-closure which will return the event handler
//for each hotkey with it's id. (id=1 For <Super>+1 etc)
function clickClosure(id) {
    return function(){
        Dash._redisplay(); //Re-order apps in dash before loading

        // Get the current actors from Dash, and get apps from the actors
        // This part is copied from the dash source (/usr/share/gnomes-shell/js/ui/dash.js)
        let children = Dash._box.get_children().filter(function(actor) {
                return actor._delegate.child &&
                       actor._delegate.child._delegate &&
                       actor._delegate.child._delegate.app;
            });
        let apps = children.map(function(actor) {
                return actor._delegate.child._delegate.app;
            });

        if(typeof(apps[id]) !== 'undefined') { //This is just to ignore problems when there is no such app (yet).
	    apps[id].activate();
            }
        }
}

function enable() {
    global.display.add_keybinding('app-key1', settings, Meta.KeyBindingFlags.NONE, clickClosure(0));
    global.display.add_keybinding('app-key2', settings, Meta.KeyBindingFlags.NONE, clickClosure(1));
    global.display.add_keybinding('app-key3', settings, Meta.KeyBindingFlags.NONE, clickClosure(2));
    global.display.add_keybinding('app-key4', settings, Meta.KeyBindingFlags.NONE, clickClosure(3));
    global.display.add_keybinding('app-key5', settings, Meta.KeyBindingFlags.NONE, clickClosure(4));
    global.display.add_keybinding('app-key6', settings, Meta.KeyBindingFlags.NONE, clickClosure(5));
    global.display.add_keybinding('app-key7', settings, Meta.KeyBindingFlags.NONE, clickClosure(6));
    global.display.add_keybinding('app-key8', settings, Meta.KeyBindingFlags.NONE, clickClosure(7));
    global.display.add_keybinding('app-key9', settings, Meta.KeyBindingFlags.NONE, clickClosure(8));
}

function disable() {
    global.display.remove_keybinding('app-key1');
    global.display.remove_keybinding('app-key2');
    global.display.remove_keybinding('app-key3');
    global.display.remove_keybinding('app-key4');
    global.display.remove_keybinding('app-key5');
    global.display.remove_keybinding('app-key6');
    global.display.remove_keybinding('app-key7');
    global.display.remove_keybinding('app-key8');
    global.display.remove_keybinding('app-key9');
}
