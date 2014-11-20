#include getETDL

openPasswordsTab: function(event) {
	if(event.button == 1) {
		var newPage = getBrowser().addTab("chrome://passwordmgr/content/passwordManager.xul");
		getBrowser().selectedTab = newPage;
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
