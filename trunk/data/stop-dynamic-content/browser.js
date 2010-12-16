#include PreferenceWatcher
#include extesnionPrefToggleStatus
#include cssFileToUserContent
#include loadUserContentSheet

stopDynamicContent: function(button) {
	toolbar_buttons.extesnionPrefToggleStatus(button, "enable_all");
	BrowserReload();
}

setDynamicContentState: function(state) {
	toolbar_buttons.cssFileToUserContent("chrome://{{chrome_name}}/content/dcontent.css", state, false, "stop-dcontent");
	document.getElementById("stop-dcontent").setAttribute("activated", state);
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("{{pref_root}}enable_all", null, toolbar_buttons.setDynamicContentState);
	toolbar_buttons.loadUserContentSheet("chrome://{{chrome_name}}/content/dcontent.css", "dcontent", "stop-dcontent");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);