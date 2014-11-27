toggleCookies: function(button) {
	toolbar_buttons.prefToggleNumber(button, 'network.cookie.cookieBehavior', [1,2,0,0]);
}

viewCookieExceptions: function(event) {
	if(event.button == 1) {
		toolbar_buttons.openPermissions("cookie",
				"cookiepermissionstitle", "cookiepermissionstext");
	}
}

deleteAllCookies: function() {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var question = stringBundle.GetStringFromName("stop-cookies-delete.question");
	var title = stringBundle.GetStringFromName("stop-cookies-delete.title");
	if(toolbar_buttons.interfaces.PromptService.confirm(null, title, question)) {
	    var cookieMgr = Components.classes["@mozilla.org/cookiemanager;1"]
	                          .getService(Ci.nsICookieManager);
	    cookieMgr.removeAll();
	}
}

toolbar_buttons.loadPrefWatcher("network.cookie.cookieBehavior", "stop-cookies");