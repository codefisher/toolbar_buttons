focusInbox: function() {
	var aServer = window.GetSelectedMsgFolders()[0].server;
	try {
		window.OpenInboxForServer(aServer);
	} catch (ex) {}
}
