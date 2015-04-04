openPasswordsTab: function(event) {
	if(event.button == 1) {
		window.getBrowser().selectedTab = window.getBrowser().addTab("chrome://passwordmgr/content/passwordManager.xul");
	}
}

viewPasswords: function() {
	var wm = toolbar_buttons.interfaces.WindowMediator;
	var win = wm.getMostRecentWindow("Toolkit:PasswordManager");
	if (win) {
		win.gCookiesWindow.setFilter(toolbar_buttons.getETDL());
		win.focus();
	} else {
		window.openDialog("chrome://passwordmgr/content/passwordManager.xul",
				"Toolkit:PasswordManager", "", {filterString : toolbar_buttons.getETDL()});
	}
}
