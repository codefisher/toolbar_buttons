readMail: function(event) {
	try {
		Cc["@mozilla.org/browser/shell-service;1"].getService(Ci.nsIShellService).openApplication(Ci.nsIShellService.APPLICATION_MAIL);
	} catch (e) {
		toolbar_buttons.initApp(event, "Mail");
	}
}