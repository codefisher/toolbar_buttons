toggleImages: function(button) {
	toolbar_buttons.prefToggleNumber(button, 'permissions.default.image', [1,2,3,1]);
	toolbar_buttons.checkBrowserReload(button.ownerDocument.defaultView);
}

viewImageExceptions: function(event) {
	if(event.button == 1) {
		toolbar_buttons.openPermissions(event, "image",
				"imagepermissionstitle", "imagepermissionstext");
	}
}

toolbar_buttons.loadPrefWatcher(document, "permissions.default.image", "image-toggle");

