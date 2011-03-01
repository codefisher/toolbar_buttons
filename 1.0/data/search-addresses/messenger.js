
MsgSearchAddresses: function() {
	var args = {directory: null};
	toolbar_buttons.OpenOrFocusWindow(args, "mailnews:absearch", "chrome://messenger/content/ABSearchDialog.xul");
}

OpenOrFocusWindow: function(args, windowType, chromeURL) {
	var desiredWindow = toolbar_buttons.GetWindowByWindowType(windowType);
	if (desiredWindow) {
		desiredWindow.focus();
		if ("refresh" in args && args.refresh) {
			desiredWindow.refresh();
		}
	} else {
		window.openDialog(chromeURL, "", "chrome,resizable,status,centerscreen,dialog=no", args);
	}
}

GetWindowByWindowType: function(windowType) {
	var windowManager = toolbar_buttons.interfaces.WindowMediator;
	return windowManager.getMostRecentWindow(windowType);
}
