SendWithNoSave: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var prefstring = "mail.identity." + win.gCurrentIdentity.key + ".fcc";
	try {
		var send = prefs.getBoolPref(prefstring);
	} catch (e) {
		prefstring = "mail.identity.default.fcc";
		var send = prefs.getBoolPref(prefstring);
	}
	if (send === false) {
		toolbar_buttons.goSendMessage(event);
	} else {
		prefs.setBoolPref(prefstring, false);
		toolbar_buttons.goSendMessage(event);
		prefs.setBoolPref(prefstring, send);
	}
}

goSendMessage: function() {
	var win = event.target.ownerDocument.defaultView;
	try {
		if (toolbar_buttons.interfaces.IOService.offline) {
			win.SendMessageLater();
		} else {
			win.SendMessage();
		}
	} catch (e) {}
}
