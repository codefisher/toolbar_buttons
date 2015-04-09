fullScreenMode: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var alertNone = toolbar_buttons.interfaces.ExtensionPrefBranch
		.getBoolPref("full.screen");
	if (alertNone === false) {
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
		var title = stringBundle.GetStringFromName("full-screen");
		var message = stringBundle.GetStringFromName("full-screen.message");
		var checkbox = stringBundle.GetStringFromName("full-screen.checkbox");
		var check = {value: false};
		toolbar_buttons.interfaces.PromptService
			.alertCheck(win, title, message, checkbox, check);
		toolbar_buttons.interfaces.ExtensionPrefBranch
			.setBoolPref("full.screen", check.value);
	}
	win.BrowserFullScreen();
}