readNews: function(event) {
	try {
		Cc["@mozilla.org/browser/shell-service;1"].getService(Ci.nsIShellService).openApplication(Ci.nsIShellService.APPLICATION_NEWS);
	} catch (e) {
		toolbar_buttons.initApp(event, "News");
	}
}