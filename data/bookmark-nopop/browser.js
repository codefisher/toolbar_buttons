bookmarkNoPopup: function() {
	var uri = toolbar_buttons.interfaces.IOService.newURI(
		window.content.document.location.href, null, null);
	var title = window.content.document.title;
	if (title === "") {
		title = window.content.document.location.href;
	}
	toolbar_buttons.interfaces.NavBookmarksService.insertBookmark(
		toolbar_buttons.interfaces.NavBookmarksService.bookmarksMenuFolder,
		uri, toolbar_buttons.interfaces.NavBookmarksService.DEFAULT_INDEX, title);
}