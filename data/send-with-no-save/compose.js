SendWithNoSave: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var prefstring = "mail.identity." + window.gCurrentIdentity.key + ".fcc";
	try {
		var send = prefs.getBoolPref(prefstring);
	} catch (e) {
		prefstring = "mail.identity.default.fcc";
		var send = prefs.getBoolPref(prefstring);
	}
	if (send === false) {
		toolbar_buttons.goSendMessage();
	} else {
		prefs.setBoolPref(prefstring, false);
		toolbar_buttons.goSendMessage();
		prefs.setBoolPref(prefstring, send);
	}
}

goSendMessage: function() {
	try {
		if (toolbar_buttons.interfaces.IOService.offline) {
			window.SendMessageLater();
		} else {
			window.SendMessage();
		}
	} catch (e) {}
}
