realPreviousMessage: function(event) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	toolbar_buttons.realNavigate(event, !prefs.getBoolPref("next"), true);
}
