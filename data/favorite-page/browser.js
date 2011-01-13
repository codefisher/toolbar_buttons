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
		var url = prefs.getCharPref(pref).split(' | ');
		toolbar_buttons.LoadURL(url[0], event);
		if(url.length > 1) {
			var browser = getBrowser();
			for(var i=1, max=url.length; i<max; i++){
				browser.addTab(url[i]);
			}
		}
	}
}