readMail: function() {
	try {
		var shell = window.getShellService();
		if (shell) {
			shell.openApplication(Ci.nsIShellService.APPLICATION_MAIL);
		}
	} catch (e) {
		toolbar_buttons.initApp("Mail");
	}
}