toggleCookies: function(button) {
	toolbar_buttons.prefToggleNumber(button, 'network.cookie.cookieBehavior', [1,2,3,0]);
}

viewCookieExceptions: function(event) {
	if(event.button == 1) {
		toolbar_buttons.openPermissions("cookie",
				"cookiepermissionstitle", "cookiepermissionstext");
	}
}

setCookieMenuItem: function(event, item) {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var cookieState = prefs.getIntPref("network.cookie.cookieBehavior");
	for(var menuitem in item.childNodes) {
		if(item.childNodes[menuitem].getAttribute('value') == cookieState) {
			item.childNodes[menuitem].setAttribute('checked', 'true');
			return;
		}
	}
}

setCookieValue: function(event) {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	if(event.originalTarget.hasAttribute('value')) {
		prefs.setIntPref("network.cookie.cookieBehavior", event.originalTarget.getAttribute('value'));
	}
}

toolbar_buttons.loadPrefWatcher("network.cookie.cookieBehavior", "stop-cookies");