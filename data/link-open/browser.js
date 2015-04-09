setHowLinksOpen: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch,
		setting = prefs.getIntPref("browser.link.open_newwindow"),
		next = [3, 2, 3, 1];
	prefs.setIntPref("browser.link.open_newwindow.restriction", 0);
	prefs.setIntPref("browser.link.open_newwindow", next[setting]);
	prefs.setIntPref("browser.link.open_external", next[setting]);
}

toolbar_buttons.loadPrefWatcher(document, "browser.link.open_newwindow", "link-open");