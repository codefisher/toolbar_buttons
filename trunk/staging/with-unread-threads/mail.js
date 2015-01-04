threadsWithUnread: function() {
	if(window.gFolderDisplay.view.specialViewThreadsWithUnread) {
		window.goDoCommand('cmd_viewAllMsgs');
	} else {
		window.goDoCommand('cmd_viewThreadsWithUnread');
	}
}
