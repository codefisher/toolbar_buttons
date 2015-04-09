stopAll: function() {
	var win = event.target.ownerDocument.defaultView;
	for (var i = 0; i < win.gBrowser.mTabContainer.childNodes.length; i++) {
		win.gBrowser.browsers[i].stop();
	}
}