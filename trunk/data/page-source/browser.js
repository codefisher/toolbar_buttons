ViewPageSourceNow: function(event) {
	if (event.button == 1) {
		var focusedWindow = window.content;
		var docCharset = "charset=" + focusedWindow.document.characterSet;
		var reference = focusedWindow.getSelection();
		if (!reference.isCollapsed) {
			window.openDialog("chrome://global/content/viewPartialSource.xul",
							"_blank", "scrollbars,resizable,chrome,dialog=no,centerscreen",
							null, docCharset, reference, "selection");
		} else {
			var sourceURL = "view-source:" + window.content.document.location.href;
			window.gBrowser.selectedTab = window.gBrowser.addTab(sourceURL);
		}
	} else if (event.button == 2) {
		var url = window.content.document.location.href;
		window.openWebPanel(url, "view-source:" + url);
	} else if (event.button != 0) {
		window.BrowserViewSourceOfDocument(window.content.document);
	}
}