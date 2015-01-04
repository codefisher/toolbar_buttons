openBookmarkManager: function() {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	if (prefs.getBoolPref("bookmark.manager.tab")) {
		var browser = window.getBrowser();
		browser.selectedTab = browser.addTab("chrome://browser/content/places/places.xul");
	} else {
		window.PlacesCommandHook.showPlacesOrganizer('AllBookmarks');
	}	
}

clickBookmarkManager: function(event) {
	if(event.button == 1) {
		var browser = window.getBrowser();
		browser.selectedTab = browser.addTab("chrome://browser/content/places/places.xul");
	}
}
