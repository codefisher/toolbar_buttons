openFindBar: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	if(prefs.getBoolPref('find-bar.toggle')) {
		if ('gFindBar' in win) { // Firefox
			if (win.gFindBar.hidden) {
				win.gFindBar.onFindCommand();
			} else {
				win.gFindBar.close();
			}
		} else { // SeaMonkey
			var findBar = win.document.getElementById("FindToolbar");
			if (findBar.hidden) {
				win.BrowserFind();
			} else {
				findBar.close();
			}
		}
	} else {
		if ('gFindBar' in win) {
			win.gFindBar.onFindCommand();
		} else {
			win.BrowserFind();
		}
	}
}