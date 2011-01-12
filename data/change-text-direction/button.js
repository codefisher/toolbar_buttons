changeTextDirection: function() {
	try {
		var browser = gBrowser.mCurrentBrowser;
	} catch (e) {
		var browser = document.getElementById("messagepane");
	}
	var view = browser.markupDocumentViewer;
	if (view.bidiTextDirection != 1) {
		view.bidiTextDirection = 1;
	} else {
		view.bidiTextDirection = 2;
	}
}