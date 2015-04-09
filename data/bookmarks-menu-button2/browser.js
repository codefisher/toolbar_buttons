bookmarksMenuButtonPopupShowing: function(event) {
	var win = event.target.ownerDocument.defaultView;
	try { // Firefox
		win.BookmarkingUI.onMainMenuPopupShowing(event);
	} catch(e) { // SeaMonkey
		win.BookmarksMenu.onPopupShowing(event, '');
	}
	if (!event.target.parentNode._placesView && event.target.parentNode.tagName == 'toolbarbutton') {
		new win.PlacesMenu(event, 'place:folder=BOOKMARKS_MENU');
	}
}