const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.uuid).gettext;

// Import config
const config = Me.imports.config;


let settings;
function init() {
    imports.gettext.bindtextdomain(Me.uuid, Me.path + "/locale");
    const GioSSS = Gio.SettingsSchemaSource;

    let schemaSource = GioSSS.new_from_directory(Me.path + "/schemas", GioSSS.get_default(), false);

    let schemaObj = schemaSource.lookup(Me.metadata["settings-schema"], true);
    if(!schemaObj) {
        throw new Error("Schema " + Me.metadata["settings-schema"] + " could not be found for extension " +
                        Me.uuid + ". Please check your installation.");
    }

    settings = new Gio.Settings({ settings_schema: schemaObj });
    
}

function addSetting(vbox, label, tooltip, conf){
    let hbox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL
    });

    let settingLabel = new Gtk.Label({
        label: _(label),
        xalign: 0
    });

    let settingSwitch = new Gtk.Switch();
    settings.bind(conf, settingSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
    settingLabel.set_tooltip_text(_(tooltip));
    settingSwitch.set_tooltip_text(_(tooltip));

    hbox.pack_start(settingLabel, true, true, 0);
    hbox.add(settingSwitch);

    vbox.add(hbox);
}

function buildPrefsWidget() {
    let vbox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        margin: 10,
        margin_top: 15,
        spacing: 10
    });

	let label = "Enable Keypad";
	let tooltip = "Do you want to use keypad numbers?";
	addSetting(vbox, label, tooltip, config.SETTINGS_USE_KEYPAD);
	
	label = "Enable Shift KP (NewWindow)";
	tooltip = "Do you want to use Ctrl+Shift+KP_N to open new windows?";
	addSetting(vbox, label, tooltip, config.SETTINGS_USE_NKP);
	
	label = "Enable Nums";
	tooltip = "Do you want to use numbers?";
	addSetting(vbox, label, tooltip, config.SETTINGS_USE_NUMS);

	label = "Enable Shift (NewWindow)";
	tooltip = "Do you want to use Ctrl+Shift+Num to open new windows?";
	addSetting(vbox, label, tooltip, config.SETTINGS_USE_NW);
	
	label = "Close Overview";
	tooltip = "Do you want the overview to close after selecting an application?";
	addSetting(vbox, label, tooltip, config.SETTINGS_CLOSE_OVERVIEW);

    label = "Cycle Windows";
    tooltip = "Do you want to cycle through windows using chosen keybindings?";
    addSetting(vbox, label, tooltip, config.SETTINGS_CYCLE_WINDOWS);

	label = "Raise First Window Only";
	tooltip = "Do you want that only the first window of the application is raised?";
	addSetting(vbox, label, tooltip, config.SETTINGS_RAISE_FIRST);

	vbox.show_all();
	return vbox;
}
