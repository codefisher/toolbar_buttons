deleteTasks: function() {
	try {
		deleteToDoCommand();
	} catch(e){
		goDoCommand('calendar_delete_todo_command');
		goDoCommand('delete_todo_command');
	}
}