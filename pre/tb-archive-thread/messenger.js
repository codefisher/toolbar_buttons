archiveSelectedThread: function() {
	let batchMover = new window.BatchMessageMover();
	var messages = [];
	var threads = [];
	var selectedMessages = window.gFolderDisplay.selectedMessages;
	for(var i = 0; i < selectedMessages.length; i++) {
		var message = selectedMessages[i];
		var thread = window.gDBView.getThreadContainingMsgHdr(message);
		if(threads.indexOf(thread.threadKey) != -1) {
			continue;
		}
		threads.push(thread.threadKey);
		for(var j = 0; j < thread.numChildren; j++) {
			 messages.push(thread.getChildHdrAt(j));
		}
	}
	batchMover.archiveMessages(messages);
}
