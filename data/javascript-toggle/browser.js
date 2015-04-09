toggleJavaScript: function(button) {
	toolbar_buttons.prefToggleStatus(button, "javascript.enabled");
	toolbar_buttons.checkBrowserReload(button.ownerDocument.defaultView);
}

toolbar_buttons.loadPrefWatcher(document, "javascript.enabled", "javascript-toggle")