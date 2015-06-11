openPageTab: function(url, event) {
	var win = event.target.ownerDocument.defaultView;
	try {
		if (event.button == 1) {
			var browser = win.getBrowser();
			browser.selectedTab = browser.addTab(url);
		}
	} catch(e) {}
}

openPage: function(url, event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	try {
		if (prefs.getBoolPref("always.new.tab")) {
			var browser = win.getBrowser();
			browser.selectedTab = browser.addTab(url);
		} else {
			win.loadURI(url);
		}
	} catch(e) {
		var uri = toolbar_buttons.interfaces.IOService.newURI(url, null, null);
		toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
	}
}

openLinkFromPrefTab: function(name, event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var url = prefs.getCharPref(name);
	if (event.button == 1) {
		var browser = win.getBrowser();
		browser.selectedTab = browser.addTab(url);
	}
}

openLinkFromPref: function(name, event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var url = prefs.getCharPref(name);
	if (prefs.getBoolPref("always.new.tab")) {
		var browser = win.getBrowser();
		browser.selectedTab = browser.addTab(url);
	} else {
		win.loadURI(url);
	}
}

OpenMailLink: function(name) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var url = prefs.getCharPref(name);
	var uri = toolbar_buttons.interfaces.IOService
			  .newURI(url, null, null);
	toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
}

openPageInTab: function(url, event) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	if('switchToTabHavingURI' in win) {
		win.switchToTabHavingURI(url, true);
	} else if('getBrowser' in win) {
		var browser = win.getBrowser();
		browser.selectedTab = browser.addTab(url);
	} else {
		var tabmail = doc.getElementById('tabmail');
		if (tabmail) {
			tabmail.openTab('contentTab', {contentPage: url});
		} else {
			win.openDialog(url, '', 'chrome,centerscreen');
		}
	}

}