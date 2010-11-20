BrowserCloseAllTabs: function() {
	while (gBrowser.mTabContainer.childNodes.length > 1) {
		gBrowser.removeCurrentTab();
	}
	getBrowser().addTab("about:blank");
	gBrowser.removeCurrentTab();
}