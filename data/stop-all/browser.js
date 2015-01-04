stopAll: function() {
	for (var i = 0; i < window.gBrowser.mTabContainer.childNodes.length; i++) {
		window.gBrowser.browsers[i].stop();
	}
}