restartMozilla: function() {
	// aks the user if they realy do want to restart
	if (toolbar_button_interfaces.ExtensionPrefBranch.getBoolPref(
			"restart") != true) {
		var stringBundle = toolbar_button_interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
		var restartQuestion = stringBundle.GetStringFromName("restart-question");
		var dontAsk = stringBundle.GetStringFromName("dont-ask");
		var restartTitle = stringBundle.GetStringFromName("restart");
		var check = {value: false};
		var result = toolbar_button_interfaces.PromptService.confirmCheck(null,
				restartTitle, restartQuestion, dontAsk, check);
		toolbar_button_interfaces.ExtensionPrefBranch.setBoolPref(
				"restart", check.value);
		if (result == false) {
			return
		}
	}
	// now ask all other interested parties
	var cancelQuit = toolbar_button_interfaces.SupportsPRBool();
	toolbar_button_interfaces.ObserverService.notifyObservers(cancelQuit,
			"quit-application-requested", "restart");

	// Something aborted the quit process.
	if (cancelQuit.data) {
		return;
	} else {
		var restart = toolbar_button_interfaces.AppStartup;
		restart.quit(restart.eRestart | restart.eAttemptQuit).focus();
	}
}