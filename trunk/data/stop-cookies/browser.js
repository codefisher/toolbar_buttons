toggleCookies: function(button) {
	toolbar_buttons.prefToggleNumber(button, 'network.cookie.cookieBehavior', [1,2,0,0]);
}

viewCookies: function(event) {
	if(event.button == 1) {
		var wm = toolbar_buttons.interfaces.WindowMediator;
		var win = wm.getMostRecentWindow("Browser:Cookies");
		var eTLDService = toolbar_buttons.interfaces.EffectiveTLDService;

		var eTLD;
		var uri = window.content.document.documentURIObject;
		try {
			eTLD = eTLDService.getBaseDomain(uri);
		} catch (e) {
			// getBaseDomain will fail if the host is an IP address or is empty
			eTLD = uri.asciiHost;
		}
		if (win) {
			win.gCookiesWindow.setFilter(eTLD);
			win.focus();
		} else {
			window.openDialog("chrome://browser/content/preferences/cookies.xul",
					"Browser:Cookies", "", {filterString : eTLD});
		}
	}
}

toolbar_buttons.loadPrefWatcher("network.cookie.cookieBehavior", "stop-cookies");