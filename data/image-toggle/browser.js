toggleImages: function(button) {
	toolbar_buttons.prefToggleNumber(button, 'permissions.default.image', [1,2,3,1]);
	toolbar_buttons.checkBrowserReload();
}

toolbar_buttons.loadPrefWatcher("permissions.default.image", "image-toggle");

