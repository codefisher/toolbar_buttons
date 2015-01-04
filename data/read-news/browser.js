readNews: function() {
	try {
		var shell = window.getShellService();
		if (shell) {
			shell.openApplication(Ci.nsIShellService.APPLICATION_NEWS);
		}
	} catch (e) {
		toolbar_buttons.initApp("News");
	}
}