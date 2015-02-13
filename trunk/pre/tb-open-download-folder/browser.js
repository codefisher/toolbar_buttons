openDefaultDownloadFolder: function() {
	var file = toolbar_buttons.interfaces.Properties.get('DfltDwnld', Ci.nsIFile)
		.QueryInterface(Ci.nsILocalFile);
	try {
		file.launch();
	} catch(e) {
		var uri = toolbar_buttons.interfaces.IOService.newFileURI(file);
		toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
	}
}