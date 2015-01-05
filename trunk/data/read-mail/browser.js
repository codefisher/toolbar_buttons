readMail: function() {
try {
		var shell = Cc["@mozilla.org/browser/shell-service;1"].getService(Ci.nsIShellService);
		shell.openApplication(Ci.nsIShellService.APPLICATION_MAIL);
	} catch (e) {
		toolbar_buttons.initApp("Mail");
	}
}