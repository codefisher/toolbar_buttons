#include checkBrowserReload
#include prefToggleStatus
#include PreferenceWatcher

toggleJavaScript: function(button) {
	toolbar_buttons.prefToggleStatus(button, "javascript.enabled");
	toolbar_buttons.checkBrowserReload();
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("javascript.enabled", "javascript-toggle");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);
