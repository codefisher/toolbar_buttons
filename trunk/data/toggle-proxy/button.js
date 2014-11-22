
toggleTheProxy: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch,
		extPrefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var proxyState = prefs.getIntPref("network.proxy.type");
	var defaultState = toolbar_buttons.interfaces.PrefService.getDefaultBranch(null).getIntPref("network.proxy.type");
	var customState = extPrefs.getIntPref("toggle.proxy");
	if(customState == defaultState) {
		defaultState = 0;
	}
	if (proxyState == customState) {
		prefs.setIntPref("network.proxy.type", defaultState);
	} else {
		prefs.setIntPref("network.proxy.type", customState);
	}
}

toolbar_buttons.loadPrefWatcher("network.proxy.type", "toggle-proxy");