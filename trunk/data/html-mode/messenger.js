toggleHtmlMode: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	value = prefs.getIntPref("mailnews.display.html_as");
	[MsgBodyAsPlaintext, MsgBodySanitized, MsgBodySanitized, MsgBodyAllowHTML][value]();
}

toolbar_buttons.loadPrefWatcher("mailnews.display.html_as", "html-mode");