function LoadCustomLinkButtonLink(event, item) {
	var url = Components.classes['@mozilla.org/preferences-service;1']
			.getService(Components.interfaces.nsIPrefService).getBranch(
					"extension.link-buttons.url.").getCharPref(item.id);
	var mode = Components.classes['@mozilla.org/preferences-service;1']
			.getService(Components.interfaces.nsIPrefService).getBranch(
					"extension.link-buttons.mode.").getIntPref(item.id);
	if(mode == 2) {
		loadURI(url);
	} else if(mode == 1) {
		var broswer = getBrowser();
		broswer.selectedTab = broswer.addTab(url);
	} else {
		if ((event.button == 1) || (event.button == 0 && event.metaKey)
				|| (event.button == 0 && event.ctrlKey)) {
			var broswer = getBrowser();
			broswer.selectedTab = broswer.addTab(url);
		} else {
			loadURI(url);
		}
	}
}
