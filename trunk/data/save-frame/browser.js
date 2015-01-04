saveFrame: function() {
	try {
		window.saveFrameDocument();
	} catch(e) {
		// Firefox 4
		var focusedWindow = document.commandDispatcher.focusedWindow;
		if (window.isContentFrame(focusedWindow)) {
			window.saveDocument(focusedWindow.document);
		}
	}
}