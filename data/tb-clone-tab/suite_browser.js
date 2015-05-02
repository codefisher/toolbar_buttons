cloneSeaTab: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var aTab = win.gBrowser.selectedTab;
	var href = aTab.linkedBrowser.contentDocument.location.href;
	win.gBrowser.selectedTab = win.gBrowser.addTab(href);
}
