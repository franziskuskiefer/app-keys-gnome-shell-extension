//Import the Main and Meta object
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Meta = imports.gi.Meta;
const Lang = imports.lang;

// Import shell
const Shell = imports.gi.Shell;

// Import the convenience.js (Used for loading settings schemas)
const Self = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Self.imports.convenience;

// Import config
const config = Self.imports.config;

function AppKeys() {
  this.init();
}

AppKeys.prototype = {
  Name : 'AppKeys',

  init : function() {
    this.settings = Convenience.getSettings();

    this.settings.connect('changed::' + config.SETTINGS_USE_KEYPAD, Lang.bind(this, this.toggleKeys));
    this.settings.connect('changed::' + config.SETTINGS_USE_NUMS, Lang.bind(this, this.toggleKeys));
    this.settings.connect('changed::' + config.SETTINGS_USE_NW, Lang.bind(this, this.toggleKeys));
    this.settings.connect('changed::' + config.SETTINGS_USE_NKP, Lang.bind(this, this.toggleKeys));
    this.settings.connect('changed::' + config.SETTINGS_CLOSE_OVERVIEW, Lang.bind(this, this.toggleKeys));
    this.settings.connect('changed::' + config.SETTINGS_RAISE_FIRST, Lang.bind(this, this.toggleKeys));
    this.settings.connect('changed::' + config.SETTINGS_CYCLE_WINDOWS, Lang.bind(this, this.toggleKeys));
    this.settings.connect('changed::' + config.SETTINGS_CYCLE_WINDOWS_ON_ACTIVE_ONLY, Lang.bind(this, this.toggleKeys));
  },

  //This is a javascript-closure which will return the event handler
  //for each hotkey with it's id. (id=1 For <Super>+1 etc)
  clickClosure : function(id, options) {
    options = options || {};
    return function() {
      // Get the current actors from Dash, and get apps from the actors
      // This part is copied from the dash source (/usr/share/gnomes-shell/js/ui/dash.js)
      // Import Dash
      const Dash = Main.overview._dash;
      let children = Dash._box.get_children().filter(function(actor) {
        return actor.child &&
               actor.child._delegate &&
               actor.child._delegate.app;
      });
      let apps = children.map(function(actor) {
        return actor.child._delegate.app;
      });

      let windows = apps[id].get_windows().filter(function(w) {
        return !w.skip_taskbar;
      });
      if (options.onlyActiveWorkspace) {
        let activeWorkspace = global.screen.get_active_workspace();
        windows = windows.filter(function(w) {
          return w.get_workspace() == activeWorkspace;
        });
      }
      if (typeof(apps[id]) !== 'undefined') {  // This is just to ignore problems when there is no such app (yet).
        if (options.newwindow || windows.length == 0)
          apps[id].open_new_window(-1);
        else {
          if (options.cycleWindows) {
            if (windows[0].has_focus()) {
              cycleThroughWindows(apps[id], windows);
            } else {
              Main.activateWindow(windows[0]);
            }
          } else {
            if (options.raiseFirst) { // raise only "first" (last used) window of the app
              if (windows[0].has_focus()){
                  windows[0].minimize();
              }
              else {
                  windows[0].activate(0);
              }
          }
            else
              apps[id].activate();
          }
        }

        // close overview after selecting application
        if (options.closeoverview)
          Main.overview.hide();
      }
    }
  },

  toggleKeys : function() {
    // TODO: could be done nicer
    this.disable();
    this.enable();
  },

  _addKeybindings : function(name, handler) {
    if (Main.wm.addKeybinding) {
      var ModeType = Shell.hasOwnProperty('ActionMode') ? Shell.ActionMode : Shell.KeyBindingMode;
      Main.wm.addKeybinding(name, this.settings, Meta.KeyBindingFlags.NONE, ModeType.NORMAL | ModeType.OVERVIEW, handler);
    } else {
      global.display.add_keybinding(name, this.settings, Meta.KeyBindingFlags.NONE, handler);
    }
  },

  _removeKeybindings : function(name) {
    if (Main.wm.removeKeybinding) {
      Main.wm.removeKeybinding(name);
    }
    else {
      global.display.remove_keybinding(name);
    }
  },

  enable : function() {
    let enableKP = this.settings.get_boolean(config.SETTINGS_USE_KEYPAD);
    let enableNUM = this.settings.get_boolean(config.SETTINGS_USE_NUMS);
    let enableNW = this.settings.get_boolean(config.SETTINGS_USE_NW);
    let enableNKP = this.settings.get_boolean(config.SETTINGS_USE_NKP);
    let close_overview = this.settings.get_boolean(config.SETTINGS_CLOSE_OVERVIEW);
    let raise_first = this.settings.get_boolean(config.SETTINGS_RAISE_FIRST);
    let cycle_windows = this.settings.get_boolean(config.SETTINGS_CYCLE_WINDOWS);
    let cycle_windows_on_active = this.settings.get_boolean(config.SETTINGS_CYCLE_WINDOWS_ON_ACTIVE_ONLY);

    for (var i = 0; i < 10; i++) {
      var j = i - 1;
      if (i == 0) j = 9;
      if (enableNUM)
        this._addKeybindings('app-key' + i, this.clickClosure(j, {closeoverview : close_overview, raiseFirst : raise_first, cycleWindows : cycle_windows, onlyActiveWorkspace : cycle_windows_on_active}));

      if (enableNW)
        this._addKeybindings('app-key-shift' + i, this.clickClosure(j, {newwindow : true, closeoverview : close_overview, cycleWindows : cycle_windows, onlyActiveWorkspace : cycle_windows_on_active}));

      if (enableNKP)
        this._addKeybindings('app-key-shift-kp' + i, this.clickClosure(j, {newwindow : true, closeoverview : close_overview, cycleWindows : cycle_windows, onlyActiveWorkspace : cycle_windows_on_active}));

      if (enableKP)
        this._addKeybindings('app-key-kp' + i, this.clickClosure(j, {closeoverview : close_overview, raiseFirst : raise_first, cycleWindows : cycle_windows, onlyActiveWorkspace : cycle_windows_on_active}));
    }
  },

  disable : function() {
    for (var i = 0; i < 10; i++) {
      this._removeKeybindings('app-key' + i);
      this._removeKeybindings('app-key-shift' + i);
      this._removeKeybindings('app-key-kp' + i);
      this._removeKeybindings('app-key-shift-kp' + i);
    }
  }

};

let recentlyClickedAppLoopId = 0;
let recentlyClickedApp = null;
let recentlyClickedAppWindows = null;
let recentlyClickedAppIndex = 0;

// This function was ported straight from Dash-to-Dock
function cycleThroughWindows(app, app_windows) {
  // Store for a little amount of time last clicked app and its windows
  // since the order changes upon window interaction
  let MEMORY_TIME=3000;

  if (recentlyClickedAppLoopId > 0)
      Mainloop.source_remove(recentlyClickedAppLoopId);
  recentlyClickedAppLoopId = Mainloop.timeout_add(MEMORY_TIME, resetRecentlyClickedApp);

  // If there isn't already a list of windows for the current app,
  // or the stored list is outdated, use the current windows list.
  if (!recentlyClickedApp ||
    recentlyClickedApp.get_id() != app.get_id() ||
    recentlyClickedAppWindows.length != app_windows.length) {
    recentlyClickedApp = app;
    recentlyClickedAppWindows = app_windows;
    recentlyClickedAppIndex = 0;
  }

  recentlyClickedAppIndex++;
  let index = recentlyClickedAppIndex % recentlyClickedAppWindows.length;
  let window = recentlyClickedAppWindows[index];

  Main.activateWindow(window);
}

function resetRecentlyClickedApp() {
  if (recentlyClickedAppLoopId > 0)
    Mainloop.source_remove(recentlyClickedAppLoopId);
  recentlyClickedAppLoopId=0;
  recentlyClickedApp =null;
  recentlyClickedAppWindows = null;
  recentlyClickedAppIndex = 0;

  return false;
}

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
