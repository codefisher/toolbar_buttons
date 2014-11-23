toggleMsgHeaders: function() {
	var modeType = Ci.nsMimeHeaderDisplayTypes, mode,
		prefs =  toolbar_buttons.interfaces.PrefBranch,
		setting = prefs.getIntPref("mail.show_headers");
	if(setting == modeType.MicroHeaders) {
		mode = modeType.NormalHeaders;
	} else if(setting == modeType.NormalHeaders) {
		mode = modeType.AllHeaders;
	} else {
		mode = modeType.MicroHeaders;
	}
	prefs.setIntPref("mail.show_headers", mode);
	AdjustHeaderView(mode);
	ReloadMessage();
}

styleMsgHeaders: function(state) {
	var button = document.getElementById('tb-toggle-headers');
	if(button) {
		toolbar_buttons.setButtonStatus(document.getElementById('tb-toggle-headers'), state);
		toolbar_buttons.styleMsgHeadersLoadSheet(state);
	}
}

styleMsgHeadersLoadSheet: function(state) {
	var sss = toolbar_buttons.interfaces.StyleSheetService,
		ios = toolbar_buttons.interfaces.IOService;
	var url = ios.newURI("chrome://{{chrome_name}}/content/headerDisplay.css", null, null);
	if(state == Ci.nsMimeHeaderDisplayTypes.MicroHeaders) {
		if(!sss.sheetRegistered(url, sss.AGENT_SHEET)) {
			sss.loadAndRegisterSheet(url, sss.AGENT_SHEET);
		}
	} else {
		if(sss.sheetRegistered(url, sss.AGENT_SHEET)) {
			sss.unregisterSheet(url, sss.AGENT_SHEET);
		}
	}
}

window.addEventListener("load", function(e) {
	var button = document.getElementById('tb-toggle-headers');
	if(button) {
		var prefs =  toolbar_buttons.interfaces.PrefBranch,
			setting = prefs.getIntPref("mail.show_headers");
		toolbar_buttons.styleMsgHeadersLoadSheet(setting);
	}
}, false);

toolbar_buttons.loadPrefWatcher("mail.show_headers", "tb-toggle-headers", toolbar_buttons.styleMsgHeaders);