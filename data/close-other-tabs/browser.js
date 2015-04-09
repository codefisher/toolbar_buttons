closeOtherTabs: function(event) {
	var win = event.target.ownerDocument.defaultView;
	win.gBrowser.removeAllTabsBut(win.gBrowser.mCurrentTab);
}