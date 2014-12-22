threadsUnread: function() {
	if(gFolderDisplay.view.showUnreadOnly) {
		goDoCommand('cmd_viewAllMsgs');
	} else {
		goDoCommand('cmd_viewUnreadMsgs');
	}
}
