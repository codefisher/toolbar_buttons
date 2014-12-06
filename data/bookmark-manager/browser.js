openBookmarkManager: function() {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	if (prefs.getBoolPref("bookmark.manager.tab")) {
		var browser = getBrowser();
		browser.selectedTab = browser.addTab("chrome://browser/content/places/places.xul");
	} else {
		//goDoCommand('Browser:ShowAllBookmarks');
		PlacesCommandHook.showPlacesOrganizer('AllBookmarks');
	}	
}

clickBookmarkManager: function(event) {
	if(event.button == 1) {
		var browser = getBrowser();
		browser.selectedTab = browser.addTab("chrome://browser/content/places/places.xul");
	}
}
