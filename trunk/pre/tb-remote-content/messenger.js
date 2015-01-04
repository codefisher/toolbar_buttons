openRemoteContent: function() {
	var bundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://messenger/locale/preferences/preferences.properties");
	var params = {  
		blockVisible   : true,
		sessionVisible : false,
		allowVisible   : true,
		prefilledHost  : "",
		permissionType : "image",
		windowTitle    : bundle.GetStringFromName("imagepermissionstitle"),
		introText      : bundle.GetStringFromName("imagepermissionstext")
	};
	window.openDialog("chrome://messenger/content/preferences/permissions.xul", "mailnews:permissions", "", params);
}