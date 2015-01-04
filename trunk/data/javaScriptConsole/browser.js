toJavaScriptConsole: function() {
	var extPrefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	if(prefs.getBoolPref('devtools.errorconsole.enabled')) {
		window.toJavaScriptConsole();
	} else {
		if(extPrefs.getIntPref("javascript.console.open") == 1) {
			window.HUDService.toggleBrowserConsole();
		} else {
			window.gDevToolsBrowser.selectToolCommand(window.gBrowser, "webconsole");
		}
	}	
}