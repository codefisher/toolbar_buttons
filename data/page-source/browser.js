ViewPageSourceNow: function(event) {
	var win = event.target.ownerDocument.defaultView;
	if (event.button == 1) {
		var focusedWindow = win.content;
		var docCharset = "charset=" + focusedWindow.document.characterSet;
		var reference = focusedWindow.getSelection();
		if (!reference.isCollapsed) {
			win.openDialog("chrome://global/content/viewPartialSource.xul",
							"_blank", "scrollbars,resizable,chrome,dialog=no,centerscreen",
							null, docCharset, reference, "selection");
		} else {
			var sourceURL = "view-source:" + win.content.document.location.href;
			win.gBrowser.selectedTab = win.gBrowser.addTab(sourceURL);
		}
	} else if (event.button == 2) {
		var url = win.content.document.location.href;
		win.openWebPanel(url, "view-source:" + url);
	} else if (event.button != 0) {
		win.BrowserViewSourceOfDocument(win.content.document);
	}
}