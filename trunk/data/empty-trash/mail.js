emptyAllTrash: function(event) {
	if(event.button == 0) {
		try {
			window.MsgEmptyTrash(); // stopped working in Thunderbird 3.1
		} catch(e) {
			// same as gFolderTreeController.emptyTrash(); in 3.1
			window.goDoCommand("cmd_emptyTrash");
		}
	} else if(event.button == 1) {
		try {
			if(!window.gFolderTreeController._checkConfirmationPrompt("emptyTrash")) {
				return;
			}
		} catch(e) {
			if(!window.confirmToProceed("emptyTrash"))  {
				return;
			}
		}
		// not what happens with smart folders in 3.1, but too scared to change
		var servers = toolbar_buttons.interfaces.MsgAccountManager.allServers;
		for(var server in fixIterator(servers, Ci.nsIMsgIncomingServer)) {
			server.rootMsgFolder.emptyTrash(window.msgWindow, null);
		}
	}
}