toggleHtmlMode: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var value = prefs.getIntPref("mailnews.display.html_as");
	[win.MsgBodyAsPlaintext, win.MsgBodySanitized, win.MsgBodySanitized, win.MsgBodyAllowHTML][value]();
}

toolbar_buttons.loadPrefWatcher(document, "mailnews.display.html_as", "html-mode");