toggleDocumentFonts: function(button) {
	toolbar_buttons.prefToggleNumber(button, "browser.display.use_document_fonts", [1,0,0]);
}

toolbar_buttons.loadPrefWatcher("browser.display.use_document_fonts", "use-document-fonts")