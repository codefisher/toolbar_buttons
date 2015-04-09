threadsWithUnread: function() {
	var win = event.target.ownerDocument.defaultView;
	if(win.gFolderDisplay.view.specialViewThreadsWithUnread) {
		win.goDoCommand('cmd_viewAllMsgs');
	} else {
		win.goDoCommand('cmd_viewThreadsWithUnread');
	}
}
