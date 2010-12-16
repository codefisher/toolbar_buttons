OpenLinkPref: function(pref, event) {
   var prefs = toolbar_button_interfaces.ExtensionPrefBranch;
	var changed = prefs.prefHasUserValue(pref);
	if (changed != true) {
		var stringBundle = toolbar_button_interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
		var message = stringBundle.GetStringFromName("change-default-page.message");
		var title = stringBundle.GetStringFromName("change-default-page.title");
		toolbar_button_interfaces.PromptService.alert(null, title, message);
	} else {
		var url = prefs.getCharPref(pref);
		if (event.button == 1) {
			openNewTabWith(url, window.content.document, null, null, false);
		} else {
			loadURI(url);
		}
	}
}