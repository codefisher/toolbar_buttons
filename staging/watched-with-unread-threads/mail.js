watchedThreadsWithUnread: function() {
	if(window.gFolderDisplay.view.specialViewWatchedThreadsWithUnread) {
		window.goDoCommand('cmd_viewAllMsgs');
	} else {
		window.goDoCommand('cmd_viewWatchedThreadsWithUnread');
	}
}
