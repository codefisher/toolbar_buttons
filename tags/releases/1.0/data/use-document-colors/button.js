toggleDocumentColors: function(button) {
	toolbar_buttons.prefToggleStatus(button, "browser.display.use_document_colors");
}

toolbar_buttons.loadPrefWatcher("browser.display.use_document_colors", "use-document-colors")