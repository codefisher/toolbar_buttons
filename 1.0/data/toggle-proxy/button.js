
toggleTheProxy: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch,
		extPrefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var proxyState = prefs.getIntPref("network.proxy.type");
	var defaultState = toolbar_buttons.interfaces.PrefService.getDefaultBranch(null).getIntPref("network.proxy.type");
	if (proxyState == defaultState) {
		prefs.setIntPref("network.proxy.type", extPrefs.getIntPref("toggle.proxy"));
	} else {
		extPrefs.setIntPref("toggle.proxy", proxyState);
		prefs.setIntPref("network.proxy.type", defaultState);
	}
}

toolbar_buttons.loadPrefWatcher("network.proxy.type", "toggle-proxy");
