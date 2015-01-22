togglePinTab: function() {
	if(window.gBrowser.selectedTab.getAttribute("pinned") == "true") {
		window.gBrowser.unpinTab(window.gBrowser.selectedTab);
	} else {
		window.gBrowser.pinTab(window.gBrowser.selectedTab);
	}
}
