#include PreferenceWatcher
#include extesnionPrefToggleStatus
#include cssFileToUserContent
#include loadUserContentSheet

stopIframe: function(button) {
	toolbar_buttons.extesnionPrefToggleStatus(button, "iframe");
	BrowserReload();
}

setIframeState: function(state) {
	toolbar_buttons.cssFileToUserContent("chrome://{{chrome_name}}/content/iframe.css", state, false, "stop-iframe");
	document.getElementById("stop-iframe").setAttribute("activated", state);
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("{{pref_root}}iframe", null, toolbar_buttons.setIframeState);
	toolbar_buttons.loadUserContentSheet("chrome://{{chrome_name}}/content/iframe.css", "iframe", "stop-iframe");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);