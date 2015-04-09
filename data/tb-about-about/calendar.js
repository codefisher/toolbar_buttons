openAboutPage: function(uri, event) {
	var win = event.target.ownerDocument.defaultView;
	win.openDialog(uri);
}