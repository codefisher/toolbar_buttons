toggleCookies: function(button) {
	toolbar_buttons.prefToggleNumber(button, 'network.cookie.cookieBehavior', [1,2,0,0]);
}

viewCookieExceptions: function(event) {
	if(event.button == 1) {
		toolbar_buttons.openPermissions("cookie",
				"cookiepermissionstitle", "cookiepermissionstext");
	}
}

toolbar_buttons.loadPrefWatcher("network.cookie.cookieBehavior", "stop-cookies");