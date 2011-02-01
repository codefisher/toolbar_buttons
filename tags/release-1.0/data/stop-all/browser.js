stopAll: function() {
	for (var i = 0; i < gBrowser.mTabContainer.childNodes.length; i++) {
		gBrowser.browsers[i].stop();
	}
}