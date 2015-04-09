threadsUnread: function(event) {
	var win = event.target.ownerDocument.defaultView;
	if(win.gFolderDisplay.view.showUnreadOnly) {
		win.goDoCommand('cmd_viewAllMsgs');
	} else {
		win.goDoCommand('cmd_viewUnreadMsgs');
	}
}
