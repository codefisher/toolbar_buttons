emptyAllTrash: function(event) {
	if(event.button == 0) {
		try {
			MsgEmptyTrash(); // stopped working in Thunderbird 3.1
		} catch(e) {
			// same as gFolderTreeController.emptyTrash(); in 3.1
			goDoCommand("cmd_emptyTrash");
		}
	} else if(event.button == 1) {
		try {
			if(!gFolderTreeController._checkConfirmationPrompt("emptyTrash")) {
				return;
			}
		} catch(e) {
			if(!confirmToProceed("emptyTrash"))  {
				return;
			}
		}
		// not what happens with smart folders in 3.1, but too scared to change
		var servers = toolbar_buttons.interfaces.MsgAccountManager.allServers;
		for(var server in fixIterator(servers, Ci.nsIMsgIncomingServer)) {
			server.rootMsgFolder.emptyTrash(msgWindow, null);
		}
	}
}

Components.utils.import("resource:///modules/iteratorUtils.jsm");
Components.utils.import("resource:///modules/MailUtils.js");
