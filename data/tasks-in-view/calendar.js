tasksInView: function() {
	try {
		changeDisplayToDoInViewCheckbox();
	} catch(e) {
		toggleTasksInView();
	}
}