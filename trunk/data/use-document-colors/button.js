#include PreferenceWatcher
#include prefToggleStatus

toggleDocumentColors: function(button) {
	toolbar_buttons.prefToggleStatus(button, "browser.display.use_document_colors");
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("browser.display.use_document_colors", "use-document-colors");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);