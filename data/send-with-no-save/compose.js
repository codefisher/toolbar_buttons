SendWithNoSave: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var prefstring = "mail.identity." + gCurrentIdentity.key + ".fcc";
	try {
		var send = prefs.getBoolPref(prefstring);
	} catch (e) {
		var send = prefs.getBoolPref("mail.identity.default.fcc");
	}
	if (send == false) {
		goDoCommand("cmd_sendButton");
	} else {
		prefs.setBoolPref(prefstring, false);
		if (gIOService && gIOService.offline) {
			SendMessageLater();
		} else {
			SendMessage();
		}
		prefs.setBoolPref(prefstring, true);
	}
}
