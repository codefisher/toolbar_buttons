toggleStatusBar: function(event) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	if(doc.getElementById("addon-bar")) {
		toolbar_buttons.toggleToolbar(event, 'addon-bar');
	} else {
		win.goToggleToolbar('status-bar','toggle_taskbar');
	}
}

toolbar_buttons.loadToggleToolbar(document, "statusbar-toggle", "status-bar");
toolbar_buttons.loadToggleToolbar(document, "statusbar-toggle", "addon-bar");