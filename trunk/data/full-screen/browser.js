fullScreenMode: function() {
	var alertNone = toolbar_button_interfaces.ExtensionPrefBranch
		.getBoolPref("full.screen");
	if (alertNone == false) {
		var stringBundle = toolbar_button_interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
		var title = stringBundle.GetStringFromName("full-screen");
		var message = stringBundle.GetStringFromName("full-screen.message");
		var checkbox = stringBundle.GetStringFromName("full-screen.checkbox");
		check = {value: false};
		toolbar_button_interfaces.PromptService
			.alertCheck(window, title, message, checkbox, check);
		toolbar_button_interfaces.ExtensionPrefBranch
			.setBoolPref("full.screen", check.value);
	}
	BrowserFullScreen();
}