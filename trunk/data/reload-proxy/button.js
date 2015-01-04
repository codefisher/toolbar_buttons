reloadPAC: function() {
	Cc['@mozilla.org/network/protocol-proxy-service;1'].getService().reloadPAC();
}

setProxyButtonState: function(state) {
	var prefs = toolbar_buttons.interfaces.PrefBranch,
		button = document.getElementById("reload-proxy");
	if(!button)
		return;
	if(prefs.getIntPref("network.proxy.type") == 2
			&& prefs.getCharPref("network.proxy.autoconfig_url") != "") {
		button.removeAttribute("disabled");
	} else {
		button.setAttribute("disabled", true);
	}
}

toolbar_buttons.loadPrefWatcher("network.proxy.type", null, toolbar_buttons.setProxyButtonState);
toolbar_buttons.loadPrefWatcher("network.proxy.autoconfig_url", null, toolbar_buttons.setProxyButtonState);