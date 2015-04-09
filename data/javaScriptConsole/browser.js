toJavaScriptConsole: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var extPrefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	if(prefs.getBoolPref('devtools.errorconsole.enabled')) {
		win.toJavaScriptConsole();
	} else {
		if(extPrefs.getIntPref("javascript.console.open") == 1) {
			win.HUDService.toggleBrowserConsole();
		} else {
			win.gDevToolsBrowser.selectToolCommand(win.gBrowser, "webconsole");
		}
	}	
}