openPasswordsTab: function(event) {
	var win = event.target.ownerDocument.defaultView;
	if(event.button == 1) {
		win.getBrowser().selectedTab = win.getBrowser().addTab("chrome://passwordmgr/content/passwordManager.xul");
	}
}

viewPasswords: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var wm = toolbar_buttons.interfaces.WindowMediator;
	var passwordWin = wm.getMostRecentWindow("Toolkit:PasswordManager");
	if (passwordWin) {
		passwordWin.gCookiesWindow.setFilter(toolbar_buttons.getETDL(event));
		passwordWin.focus();
	} else {
		win.openDialog("chrome://passwordmgr/content/passwordManager.xul",
				"Toolkit:PasswordManager", "", {filterString : toolbar_buttons.getETDL(event)});
	}
}
