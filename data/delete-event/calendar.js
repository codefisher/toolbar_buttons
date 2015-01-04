deleteEvent: function() {
	try{
		window.deleteEventCommand();
	} catch(e) {
		window.goDoCommand('calendar_delete_event_command');
		window.goDoCommand('delete_command');
	}
}