
MsgSearchAddresses: function(event) {
	var args = {directory: null};
	toolbar_buttons.OpenOrFocusWindow(event, args, "mailnews:absearch", "chrome://messenger/content/ABSearchDialog.xul");
}

OpenOrFocusWindow: function(event, args, windowType, chromeURL) {
	var win = event.target.ownerDocument.defaultView;
	var desiredWindow = toolbar_buttons.GetWindowByWindowType(windowType);
	if (desiredWindow) {
		desiredWindow.focus();
		if ("refresh" in args && args.refresh) {
			desiredWindow.refresh();
		}
	} else {
		win.openDialog(chromeURL, "", "chrome,resizable,status,centerscreen,dialog=no", args);
	}
}

GetWindowByWindowType: function(windowType) {
	var windowManager = toolbar_buttons.interfaces.WindowMediator;
	return windowManager.getMostRecentWindow(windowType);
}
