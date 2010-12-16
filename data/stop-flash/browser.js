#include PreferenceWatcher
#include extesnionPrefToggleStatus
#include cssFileToUserContent
#include loadUserContentSheet

stopFlash: function(button) {
	toolbar_buttons.extesnionPrefToggleStatus(button, "flash");
	BrowserReload();
}

setFlashState: function(state) {
	toolbar_buttons.cssFileToUserContent("chrome://{{chrome_name}}/content/flash.css", state, false, "stop-flash");
	document.getElementById("stop-flash").setAttribute("activated", state);
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("{{pref_root}}flash", null, toolbar_buttons.setFlashState);
	toolbar_buttons.loadUserContentSheet("chrome://{{chrome_name}}/content/flash.css", "flash", "stop-flash");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);