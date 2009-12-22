#include LoadURL

openExtensionTab: function(event) {
	if(event.button == 1) {
		toolbar_buttons.LoadURL('chrome://mozapps/content/extensions/extensions.xul', event);
		return true;
	}
}