cloneTab: function(event) {
	var win = event.target.ownerDocument.defaultView;
	win.gBrowser.duplicateTab(win.gBrowser.selectedTab);
}
