openOptionsTab: function(event) {
	if(event.button == 1) {
		toolbar_buttons.LoadURL('chrome://browser/content/preferences/preferences.xul', event);
		return true;
	}
}