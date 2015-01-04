deleteTasks: function() {
	try {
		window.deleteToDoCommand();
	} catch(e){
		window.goDoCommand('calendar_delete_todo_command');
		window.goDoCommand('delete_todo_command');
	}
}