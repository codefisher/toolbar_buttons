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
		window.goDoCommand("cmd_sendButton");
	} else {
		prefs.setBoolPref(prefstring, false);
		try {
			if (toolbar_buttons.interfaces.IOService.offline) {
				window.SendMessageLater();
			} else {
				window.SendMessage();
			}
		} catch (e) {}
		prefs.setBoolPref(prefstring, send);
	}
}
