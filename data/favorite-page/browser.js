OpenLinkPref: function(pref, event) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var changed = prefs.prefHasUserValue(pref);
	if (changed != true) {
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
		var message = stringBundle.GetStringFromName("change-default-page.message");
		var title = stringBundle.GetStringFromName("change-default-page.title");
		toolbar_buttons.interfaces.PromptService.alert(null, title, message);
	} else {
		var url = prefs.getCharPref(pref);
		toolbar_buttons.LoadURL(url, event);
	}
}