toggleJavaScript: function(button) {
	toolbar_buttons.prefToggleStatus(button, "javascript.enabled");
	toolbar_buttons.checkBrowserReload();
}

toolbar_buttons.loadPrefWatcher("javascript.enabled", "javascript-toggle")