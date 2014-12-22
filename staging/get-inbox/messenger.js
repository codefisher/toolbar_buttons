focusInbox: function() {
	var aServer = GetSelectedMsgFolders()[0].server;
	try {
		window.OpenInboxForServer(aServer);
	} catch (ex) {}
}
