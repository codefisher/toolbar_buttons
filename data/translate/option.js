loadTranslateOverlay: function() {
	var file = toolbar_button_interfaces.Properties.get('ProfD', Ci.nsIFile);
	file.append("translate-options-overlay.xul");
	var fileHandler = toolbar_button_interfaces.IOService.getProtocolHandler("file")
		.QueryInterface(Ci.nsIFileProtocolHandler);
	var overlayFileURI = fileHandler.getURLSpecFromFile(file);
	document.loadOverlay(overlayFileURI, null);
}
