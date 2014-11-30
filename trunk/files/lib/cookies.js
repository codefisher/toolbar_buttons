deleteAllCookies: function() {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var question = stringBundle.GetStringFromName("stop-cookies-delete.question");
	var title = stringBundle.GetStringFromName("stop-cookies-delete.title");
	var prompt = toolbar_buttons.interfaces.ExtensionPrefBranch.getBoolPref("delete.cookies.check");
	if(!prompt || toolbar_buttons.interfaces.PromptService.confirm(null, title, question)) {
	    var cookieMgr = Components.classes["@mozilla.org/cookiemanager;1"]
	                          .getService(Ci.nsICookieManager);
	    cookieMgr.removeAll();
	}
}

deleteSessionCookie: function() {
	var cookieEnumeration = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2).enumerator;
	var cookieManager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2);
	while(cookieEnumeration.hasMoreElements()) {
		var cookieObject = cookieEnumeration.getNext().QueryInterface(Components.interfaces.nsICookie2);
		if(cookieObject.isSession) {
			cookieManager.remove(cookie.host, cookie.name, cookie.path, false);
		}
	}
}