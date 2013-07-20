//Import the Main and Meta object
const Main = imports.ui.main;
const Meta = imports.gi.Meta;

//Import shell
const Shell = imports.gi.Shell;
//Import Dash also
const Dash = Main.overview._dash;


//Import the convenience.js (Used for loading settings schemas)
const Self = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Self.imports.convenience;
const settings = Convenience.getSettings();
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
                return actor.child &&
                       actor.child._delegate &&
                       actor.child._delegate.app;
            });
        let apps = children.map(function(actor) {
                return actor.child._delegate.app;
            });


        if(typeof(apps[id]) !== 'undefined') { //This is just to ignore problems when there is no such app (yet).
        apps[id].activate();
            }
        }
}

function enable() {
    for(var i=1; i<10; i++) {
        global.display.add_keybinding('app-key'+i, settings, Meta.KeyBindingFlags.NONE, clickClosure(i-1));
        Main.wm.setCustomKeybindingHandler('app-key'+i, Shell.KeyBindingMode.NORMAL, clickClosure(i-1));

        global.display.add_keybinding('app-key-kp'+i, settings, Meta.KeyBindingFlags.NONE, clickClosure(i-1));
        Main.wm.setCustomKeybindingHandler('app-key-kp'+i, Shell.KeyBindingMode.NORMAL, clickClosure(i-1));
    }
}

function disable() {
    for(var i=1; i<10; i++) {
        global.display.remove_keybinding('app-key'+i);
        global.display.remove_keybinding('app-key-kp'+i);
    }
}
