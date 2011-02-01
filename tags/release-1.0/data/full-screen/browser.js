fullScreenMode: function() {
	var alertNone = toolbar_buttons.interfaces.ExtensionPrefBranch
		.getBoolPref("full.screen");
	if (alertNone == false) {
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
		var title = stringBundle.GetStringFromName("full-screen");
		var message = stringBundle.GetStringFromName("full-screen.message");
		var checkbox = stringBundle.GetStringFromName("full-screen.checkbox");
		check = {value: false};
		toolbar_buttons.interfaces.PromptService
			.alertCheck(window, title, message, checkbox, check);
		toolbar_buttons.interfaces.ExtensionPrefBranch
			.setBoolPref("full.screen", check.value);
	}
	BrowserFullScreen();
}