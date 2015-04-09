focusInbox: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var aServer = win.GetSelectedMsgFolders()[0].server;
	try {
		win.OpenInboxForServer(aServer);
	} catch (ex) {}
}
