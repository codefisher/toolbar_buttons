#include checkBrowserReload
#include prefToggleStatus
#include PreferenceWatcher

toggleJavaScript: function(button) {
	toolbar_buttons.prefToggleStatus(button, "javascript.enabled");
	toolbar_buttons.checkBrowserReload();
}

window.addEventListener("load", function(e) {
	toolbar_buttons.PreferenceWatcher.startup("javascript.enabled", "javascript-toggle", "bool");
}, false);
window.addEventListener("unload", function(e) {
	toolbar_buttons.PreferenceWatcher.shutdown();
}, false);