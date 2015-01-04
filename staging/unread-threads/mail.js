threadsUnread: function() {
	if(window.gFolderDisplay.view.showUnreadOnly) {
		window.goDoCommand('cmd_viewAllMsgs');
	} else {
		window.goDoCommand('cmd_viewUnreadMsgs');
	}
}
