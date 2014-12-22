toggleDocumentColors: function(button) {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var obj = {};
	var children = prefs.getChildList("browser.display.document_color_us", obj); // I droped the last letter, not sure if this includes itself
	if(obj.value == 0) {
		toolbar_buttons.prefToggleStatus(button, "browser.display.use_document_colors");
	} else {
		toolbar_buttons.prefToggleNumber(button, "browser.display.use_document_colors",  [2, 2, 0]);
	}
}

loadDocumentColors: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var obj = {};
	var children = prefs.getChildList("browser.display.document_color_us", obj);
	if(obj.value == 0) {
		toolbar_buttons.loadPrefWatcher("browser.display.use_document_colors", "use-document-colors");
	} else {
		toolbar_buttons.loadPrefWatcher("browser.display.document_color_use", "use-document-colors");
	}
}
	
toolbar_buttons.loadDocumentColors();
