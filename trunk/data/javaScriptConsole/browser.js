toJavaScriptConsole: function() {
	var extPrefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	if(prefs.getBoolPref('devtools.errorconsole.enabled')) {
		toJavaScriptConsole();
	} else {
		if(extPrefs.getIntPref("javascript.console.open") == 1) {
			HUDService.toggleBrowserConsole();
		} else {
			gDevToolsBrowser.selectToolCommand(gBrowser, "webconsole");
		}
	}	
}