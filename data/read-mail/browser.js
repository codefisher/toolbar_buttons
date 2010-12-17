readMail: function() {
	try {
		var shell = getShellService();
		if (shell) {
			shell.openApplication(Components.interfaces.nsIShellService.APPLICATION_MAIL);
		}
	} catch (e) {
		toolbar_buttons.initApp("Mail");
	}
}