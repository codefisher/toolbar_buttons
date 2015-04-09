deleteEvent: function(event) {
	var win = event.target.ownerDocument.defaultView;
	try{
		win.deleteEventCommand();
	} catch(e) {
		win.goDoCommand('calendar_delete_event_command');
		win.goDoCommand('delete_command');
	}
}