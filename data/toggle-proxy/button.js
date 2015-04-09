
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

setProxyMenuItem: function(event, item) {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var proxyState = prefs.getIntPref("network.proxy.type");
	for(var menuitem in item.childNodes) {
		if(item.childNodes[menuitem].getAttribute('value') == proxyState) {
			item.childNodes[menuitem].setAttribute('checked', 'true');
			return;
		}
	}
}

setProxyValue: function(event) {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	prefs.setIntPref("network.proxy.type", event.originalTarget.getAttribute('value'));
}

toolbar_buttons.loadPrefWatcher(document, "network.proxy.type", "toggle-proxy");