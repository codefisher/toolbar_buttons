tasksInView: function() {
	try {
		window.changeDisplayToDoInViewCheckbox();
	} catch(e) {
		window.toggleTasksInView();
	}
}