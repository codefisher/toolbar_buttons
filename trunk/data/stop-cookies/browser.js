toggleCookies: function(button) {
	toolbar_buttons.prefToggleNumber(button, 'network.cookie.cookieBehavior', [1,2,0,0]);
}

toolbar_buttons.loadPrefWatcher("network.cookie.cookieBehavior", "stop-cookies");