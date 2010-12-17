readNews: function() {
	try {
		var shell = getShellService();
		if (shell) {
			shell.openApplication(Components.interfaces.nsIShellService.APPLICATION_NEWS);
		}
	} catch (e) {
		toolbar_buttons.initApp("News");
	}
}