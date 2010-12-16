#include PreferenceWatcher
#include prefToggleStatus

toggleDocumentFonts: function(button) {
	toolbar_buttons.prefToggleNumber(button, "browser.display.use_document_fonts", [1,0,0]);
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("browser.display.use_document_fonts", "use-document-fonts");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);