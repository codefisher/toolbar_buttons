togglePinTab: function(event) {
	var win = event.target.ownerDocument.defaultView;
	if(win.gBrowser.selectedTab.getAttribute("pinned") == "true") {
		win.gBrowser.unpinTab(win.gBrowser.selectedTab);
	} else {
		win.gBrowser.pinTab(win.gBrowser.selectedTab);
	}
}
