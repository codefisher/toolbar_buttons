openCookieTab: function(event) {
	if(event.button == 1) {
		var newPage = getBrowser().addTab("chrome://browser/content/preferences/cookies.xul");
		getBrowser().selectedTab = newPage;
	}
}

viewCookies: function() {
	var wm = toolbar_buttons.interfaces.WindowMediator;
	var win = wm.getMostRecentWindow("Browser:Cookies");
	if (win) {
		win.gCookiesWindow.setFilter(toolbar_buttons.getETDL());
		win.focus();
	} else {
		window.openDialog("chrome://browser/content/preferences/cookies.xul",
				"Browser:Cookies", "", {filterString : toolbar_buttons.getETDL()});
	}
}
