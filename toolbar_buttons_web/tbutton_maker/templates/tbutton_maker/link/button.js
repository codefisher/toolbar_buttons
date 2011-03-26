function LoadCustomLinkButtonLink(event, item) {
	var url = Components.classes['@mozilla.org/preferences-service;1']
			.getService(Components.interfaces.nsIPrefService).getBranch(
					"extension.link-buttons.url.").getCharPref(item.id)
	if ((event.button == 1) || (event.button == 0 && event.metaKey)
			|| (event.button == 0 && event.ctrlKey)) {
		var newPage = getBrowser().addTab(url);
		getBrowser().selectedTab = newPage;
	} else {
		loadURI(url);
	}
}