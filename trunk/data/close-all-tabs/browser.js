BrowserCloseAllTabs: function() {
	window.gBrowser.removeAllTabsBut(window.gBrowser.addTab("about:blank"));
}