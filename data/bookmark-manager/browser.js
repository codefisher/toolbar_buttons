openBookmarkManager: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	if (prefs.getBoolPref("bookmark.manager.tab")) {
		var browser = win.getBrowser();
		browser.selectedTab = browser.addTab("chrome://browser/content/places/places.xul");
	} else {
		win.PlacesCommandHook.showPlacesOrganizer('AllBookmarks');
	}	
}

clickBookmarkManager: function(event) {
	var win = event.target.ownerDocument.defaultView;
	if(event.button == 1) {
		var browser = win.getBrowser();
		browser.selectedTab = browser.addTab("chrome://browser/content/places/places.xul");
	}
}
