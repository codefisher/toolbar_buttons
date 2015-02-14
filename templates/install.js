	var prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch("{{pref_root}}");
	var version = "{{version}}";
	var currentVersion = prefs.getCharPref("{{current_version_pref}}");
	var url = "{{homepage_url}}updated/{{version}}/";
	if(currentVersion == "") {
		url = "{{homepage_url}}installed/{{version}}/";
	}
	if(currentVersion != version) {
		prefs.setCharPref("{{current_version_pref}}", version);
		let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
		let win = wm.getMostRecentWindow("navigator:browser");
		if(win) {
			let domWindow = win.QueryInterface(Ci.nsIDOMWindow);
			domWindow.getBrowser().addTab(url);
		} else {
			var uri = toolbar_buttons.interfaces.IOService.newURI(url, null, null);
			toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
		}
	}