toggleDocumentColors: function(button) {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var obj = {};
	var children = prefs.getChildList("browser.display.document_color_us", obj); // I droped the last letter, not sure if this includes itself
	if(obj.value == 0) {
		toolbar_buttons.prefToggleStatus(button, "browser.display.use_document_colors");
	} else {
		toolbar_buttons.prefToggleNumber(button, "browser.display.document_color_use",  [2, 2, 1]);
	}
}

loadDocumentColors: function(doc) {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var obj = {};
	var children = prefs.getChildList("browser.display.document_color_us", obj);
	if(obj.value == 0) {
		toolbar_buttons.loadPrefWatcher(doc, "browser.display.use_document_colors", "use-document-colors");
	} else {
		toolbar_buttons.loadPrefWatcher(doc, "browser.display.document_color_use", "use-document-colors");
	}
}
	
toolbar_buttons.loadDocumentColors(document);
