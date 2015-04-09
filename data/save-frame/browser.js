saveFrame: function(event) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	try {
		win.saveFrameDocument();
	} catch(e) {
		// Firefox 4
		var focusedWindow = doc.commandDispatcher.focusedWindow;
		if (win.isContentFrame(focusedWindow)) {
			win.saveDocument(focusedWindow.document);
		}
	}
}