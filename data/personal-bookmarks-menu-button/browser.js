personalBookmakrsMenuButon: function(item, event) {
	var win = item.ownerDocument.defaultView;
	if (!item.parentNode._placesView && event.target.parentNode.tagName == 'toolbarbutton') {
		new win.PlacesMenu(event, 'place:folder=TOOLBAR');
	}
}