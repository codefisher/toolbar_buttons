toggleHtmlMode: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var value = prefs.getIntPref("mailnews.display.html_as");
	[window.MsgBodyAsPlaintext, window.MsgBodySanitized, window.MsgBodySanitized, window.MsgBodyAllowHTML][value]();
}

toolbar_buttons.loadPrefWatcher("mailnews.display.html_as", "html-mode");