bookmarkNoPopup: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var uri = toolbar_buttons.interfaces.IOService.newURI(
		win.content.document.location.href, null, null);
	var title = win.content.document.title;
	if (title === "") {
		title = win.content.document.location.href;
	}
	toolbar_buttons.interfaces.NavBookmarksService.insertBookmark(
		toolbar_buttons.interfaces.NavBookmarksService.bookmarksMenuFolder,
		uri, toolbar_buttons.interfaces.NavBookmarksService.DEFAULT_INDEX, title);
}