saveFrame: function() {
	try {
		saveFrameDocument();
	} catch(e) {
		// Firefox 4
		var focusedWindow = document.commandDispatcher.focusedWindow;
		if (isContentFrame(focusedWindow)) {
			saveDocument(focusedWindow.document);
		}
	}
}