#include toggleToolbar

toggleTasks: function(event) {
	try {
		return toolbar_buttons.toggleToolbar(event, 'taskBox');
	} catch(e) {
		return toolbar_buttons.toggleToolbar(event, 'todo-tab-panel');
	}
}