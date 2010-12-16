#include PreferenceWatcher

reloadPAC: function() {
	Components.classes['@mozilla.org/network/protocol-proxy-service;1'].getService().reloadPAC();
}

setProxyButtonState: function(state) {
	var prefs = toolbar_button_interfaces.PrefBranch,
		button = document.getElementById("reload-proxy");
	if(prefs.getIntPref("network.proxy.type") == 2
			&& prefs.getCharPref("network.proxy.autoconfig_url") != "") {
		button.removeAttribute("disabled");
	} else {
		button.setAttribute("disabled", true);
	}
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("network.proxy.type", null, toolbar_buttons.setProxyButtonState);
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("network.proxy.autoconfig_url", null, toolbar_buttons.setProxyButtonState);
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);
