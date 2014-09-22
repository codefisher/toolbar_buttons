watchedThreadsWithUnread: function() {
	if(gFolderDisplay.view.specialViewWatchedThreadsWithUnread) {
		goDoCommand('cmd_viewAllMsgs');
	} else {
		goDoCommand('cmd_viewWatchedThreadsWithUnread');
	}
}
