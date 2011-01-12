toggleMinimumFontSize: function(item) {
	var extPrefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var promptService = toolbar_buttons.interfaces.PromptService;
	var strBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	try {
		prefs.getIntPref("font.minimum-size.x-western");
	} catch (e) {
		prefs.setIntPref("font.minimum-size.x-western", 0);
	}
	if (prefs.getIntPref("font.minimum-size.x-western") == 0 &&
			extPrefs.getIntPref("minimum.font.size") == 0) {
		var message = strBundle.GetStringFromName("min-font-message");
		var title = strBundle.GetStringFromName("min-font-title");
		var check = {value: false};
		var input = {value: "14"};
		var result = promptService.prompt(null, title, message, input, null, check);
		if (result) {
			extPrefs.setIntPref("minimum.font.size", input.value.replace(/[^0-9]/, ""));
		} else {
			return;
		}
	} else if (extPrefs.getIntPref("minimum.font.size") == 0) {
		extPrefs.setIntPref("minimum.font.size", prefs.getIntPref("font.minimum-size.x-western"));
	}
	if (prefs.getIntPref("font.minimum-size.x-western") == 0) {
		prefs.setIntPref("font.minimum-size.x-western", extPrefs.getIntPref("minimum.font.size"));
	} else {
		prefs.setIntPref("font.minimum-size.x-western", 0);
	}
}

toolbar_buttons.loadPrefWatcher("font.minimum-size.x-western", "min-font-size");
