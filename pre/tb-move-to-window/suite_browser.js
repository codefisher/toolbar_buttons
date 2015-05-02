replaceTabWithWindow: function(event, aTab, aOptions) {
	var win = event.target.ownerDocument.defaultView;
	var browser = win.gBrowser;
	if (browser.tabs.length == 1) {
		return null;
	}
	var options = "chrome,dialog=no,all";
	for (var name in aOptions) {
		options += "," + name + "=" + aOptions[name];
	}
	var href = aTab.linkedBrowser.contentDocument.location.href;
	// tell a new window to take the "dropped" tab
	var res = win.openDialog(win.getBrowserURL(), "_blank", options, href);
	browser.removeTab(aTab);
	return res;
}