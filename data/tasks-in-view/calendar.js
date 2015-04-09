tasksInView: function(event {
	var win = event.target.ownerDocument.defaultView;
	try {
		win.changeDisplayToDoInViewCheckbox();
	} catch(e) {
		win.toggleTasksInView();
	}
}