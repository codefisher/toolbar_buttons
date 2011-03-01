deleteEvent: function() {
	try{
		deleteEventCommand();
	} catch(e) {
		goDoCommand('calendar_delete_event_command');
		goDoCommand('delete_command');
	}
}