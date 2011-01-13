toggleCookies: function(button) {
	toolbar_buttons.prefToggleNumber(button, 'network.cookie.cookieBehavior', [1,2,0,0]);
}

viewCookieExceptions: function(event) {
	if(event.button == 1) {
		var eTLDService = toolbar_buttons.interfaces.EffectiveTLDService;

		var eTLD;
		var uri = window.content.document.documentURIObject;
		try {
			eTLD = eTLDService.getBaseDomain(uri);
		} catch (e) {
			// getBaseDomain will fail if the host is an IP address or is empty
			eTLD = uri.asciiHost;
		}
		var bundlePreferences = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://browser/locale/preferences/preferences.properties");
		var params = { blockVisible   : true,
					   sessionVisible : true,
					   allowVisible   : true,
					   prefilledHost  : eTLD,
					   permissionType : "cookie",
					   windowTitle	: bundlePreferences.GetStringFromName("cookiepermissionstitle"),
					   introText	  : bundlePreferences.GetStringFromName("cookiepermissionstext") };
		window.openDialog("chrome://browser/content/preferences/permissions.xul",
				"Browser:Permissions", "", params);
	}
}

toolbar_buttons.loadPrefWatcher("network.cookie.cookieBehavior", "stop-cookies");