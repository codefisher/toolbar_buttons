openPageTab: function(url, event) {
	try {
		if (event.button == 1) {
			var browser = window.getBrowser();
			browser.selectedTab = browser.addTab(url);
		}
	} catch(e) {}
}

openPage: function(url) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	try {
		if (prefs.getBoolPref("always.new.tab")) {
			var browser = window.getBrowser();
			browser.selectedTab = browser.addTab(url);
		} else {
			window.loadURI(url);
		}
	} catch(e) {
		var uri = toolbar_buttons.interfaces.IOService.newURI(url, null, null);
		toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
	}
}

LoadURL: function(url, event) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	if (event.button == 1 || prefs.getBoolPref("always.new.tab")) {
		var browser = window.getBrowser();
		browser.selectedTab = browser.addTab(url);
	} else if (event.button == 0) {
		window.loadURI(url);
	}
}

OpenLinkFromPref: function(name, event) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var url = prefs.getCharPref(name);
	if (event.button == 1 || prefs.getBoolPref("always.new.tab")) {
		var browser = window.getBrowser();
		browser.selectedTab = browser.addTab(url);
	} else if (event.button == 0) {
		window.loadURI(url);
	}
}

OpenMailLink: function(name) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var url = prefs.getCharPref(name);
	var uri = toolbar_buttons.interfaces.IOService
			  .newURI(url, null, null);
	toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
}