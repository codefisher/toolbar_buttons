toggleStatusBar: function(event) {
	if(document.getElementById("addon-bar")) {
		toolbar_buttons.toggleToolbar(event, 'addon-bar');
	} else {
		window.goToggleToolbar('status-bar','toggle_taskbar');
	}
}

toolbar_buttons.loadToggleToolbar("statusbar-toggle", "status-bar");
toolbar_buttons.loadToggleToolbar("statusbar-toggle", "addon-bar");