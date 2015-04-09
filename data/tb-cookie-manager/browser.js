openCookieTab: function(event) {
	var win = event.target.ownerDocument.defaultView;
	if(event.button == 1) {
		win.getBrowser().selectedTab = win.getBrowser().addTab("chrome://browser/content/preferences/cookies.xul");;
	}
}

viewCookies: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var wm = toolbar_buttons.interfaces.WindowMediator;
	var cookieWin = wm.getMostRecentWindow("Browser:Cookies");
	if (cookieWin) {
		cookieWin.gCookiesWindow.setFilter(toolbar_buttons.getETDL(event));
		cookieWin.focus();
	} else {
		win.openDialog("chrome://browser/content/preferences/cookies.xul",
				"Browser:Cookies", "", {filterString : toolbar_buttons.getETDL(event)});
	}
}
