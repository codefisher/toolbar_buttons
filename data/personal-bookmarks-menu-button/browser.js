personalBookmarksMenuButton: function(item, event) {
	var win = item.ownerDocument.defaultView;
	if (event.target == event.currentTarget) {
		new win.PlacesMenu(event, 'place:folder=TOOLBAR');
	}
}