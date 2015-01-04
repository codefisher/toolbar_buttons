showCookieExceptions: function() {
	var bundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://messenger/locale/preferences/preferences.properties");
	var params = { 
		blockVisible   : true,
		sessionVisible : true,
		allowVisible   : true,
		prefilledHost  : "",
		permissionType : "cookie",
		windowTitle    : bundle.getString("cookiepermissionstitle"),
		introText      : bundle.getString("cookiepermissionstext")
	};
	document.documentElement.openWindow("mailnews:permissions", "chrome://messenger/content/preferences/permissions.xul", "", params);
}
