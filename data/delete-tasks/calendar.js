deleteTasks: function(event) {
	var win = event.target.ownerDocument.defaultView;
	try {
		win.deleteToDoCommand();
	} catch(e){
		win.goDoCommand('calendar_delete_todo_command');
		win.goDoCommand('delete_todo_command');
	}
}