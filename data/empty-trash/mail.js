emptyAllTrashClick: function(event) {
	var win = event.target.ownerDocument.defaultView;
	if(event.button == 1) {
		try {
			if(!win.gFolderTreeController._checkConfirmationPrompt("emptyTrash")) {
				return;
			}
		} catch(e) {
			if(!win.confirmToProceed("emptyTrash"))  {
				return;
			}
		}
		// not what happens with smart folders in 3.1, but too scared to change
		var servers = toolbar_buttons.interfaces.MsgAccountManager.allServers;
		for(var server in fixIterator(servers, Ci.nsIMsgIncomingServer)) {
			server.rootMsgFolder.emptyTrash(win.msgWindow, null);
		}
	}
}

emptyAllTrash: function(event) {
	var win = event.target.ownerDocument.defaultView;
	try {
		win.MsgEmptyTrash(); // stopped working in Thunderbird 3.1
	} catch (e) {
		// same as gFolderTreeController.emptyTrash(); in 3.1
		win.goDoCommand("cmd_emptyTrash");
	}
}