changeTextDirection: function() {
	try {
		var browser = gBrowser.mCurrentBrowser;
	} catch (e) {
		var browser = document.getElementById("messagepane");
	}
}