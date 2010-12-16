#include PreferenceWatcher
#include extesnionPrefToggleStatus
#include cssFileToUserContent
#include loadUserContentSheet
#include checkBrowserReload

stopAnimation: function(button) {
	toolbar_buttons.extesnionPrefToggleStatus(button, "marquee");
	BrowserReload();
}

setAnimationState: function(state) {
	var prefs = toolbar_button_interfaces.PrefBranch;
	prefs.setBoolPref("browser.blink_allowed", !state);
	prefs.setCharPref("image.animation_mode", state ? "none" : "normal");
	toolbar_buttons.cssFileToUserContent("chrome://{{chrome_name}}/content/marquee.css", state, false, "stop-animation");
	document.getElementById("stop-animation").setAttribute("activated", state);
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("{{pref_root}}marquee", null, toolbar_buttons.setAnimationState);
	toolbar_buttons.loadUserContentSheet("chrome://{{chrome_name}}/content/marquee.css", "marquee", "stop-animation");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);