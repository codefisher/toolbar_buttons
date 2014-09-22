threadsWithUnread: function() {
	if(gFolderDisplay.view.specialViewThreadsWithUnread) {
		goDoCommand('cmd_viewAllMsgs');
	} else {
		goDoCommand('cmd_viewThreadsWithUnread');
	}
}
