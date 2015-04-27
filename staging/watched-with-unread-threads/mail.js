watchedThreadsWithUnread: function(event) {
	var win = event.target.ownerDocument.defaultView;
	if(win.gFolderDisplay.view.specialViewWatchedThreadsWithUnread) {
		win.goDoCommand('cmd_viewAllMsgs');
	} else {
		win.goDoCommand('cmd_viewWatchedThreadsWithUnread');
	}
}
