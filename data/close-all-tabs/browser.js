BrowserCloseAllTabs: function(event) {
	var win = event.target.ownerDocument.defaultView;
	win.gBrowser.removeAllTabsBut(win.gBrowser.addTab("about:blank"));
}