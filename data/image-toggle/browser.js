#include prefToggleNumber
#include PreferenceWatcher

toggleImages: function(button) {
	toolbar_buttons.prefToggleNumber(button, 'permissions.default.image', [1,2,3,1]);
	toolbar_buttons.checkBrowserReload();
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("permissions.default.image", "image-toggle", "int");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);
