bookmarkNoPopup: function() {
    var uri = toolbar_button_interfaces.IOService.newURI(
        window.content.document.location.href, null, null);
    var title = window.content.document.title;
    if (title == "") {
        title = window.content.document.location.href;
    }
    toolbar_button_interfaces.NavBookmarksService.insertBookmark(
        toolbar_button_interfaces.NavBookmarksService.bookmarksMenuFolder,
        uri, toolbar_button_interfaces.NavBookmarksService.DEFAULT_INDEX, title);
}