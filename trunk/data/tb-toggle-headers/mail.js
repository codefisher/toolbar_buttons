toggleMsgHeaders: function() {
	var modeType = Ci.nsMimeHeaderDisplayTypes, mode,
		prefs =  toolbar_buttons.interfaces.PrefBranch,
		setting = prefs.getIntPref("mail.show_headers");
	if(setting == modeType.MicroHeaders || setting == modeType.NormalHeaders) {
		mode = modeType.AllHeaders;
	} else {
		mode = modeType.NormalHeaders;
	}
	prefs.setIntPref("mail.show_headers", mode);
	window.AdjustHeaderView(mode);
	window.ReloadMessage();
}

