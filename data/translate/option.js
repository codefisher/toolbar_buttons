loadTranslateOverlay: function() {
	var file = toolbar_buttons.interfaces.Properties.get('ProfD', Ci.nsIFile);
	file.append("tb-translate-options.xul");
	var fileHandler = toolbar_button_interfaces.IOService.getProtocolHandler("file")
		.QueryInterface(Ci.nsIFileProtocolHandler);
	var overlayFileURI = fileHandler.getURLSpecFromFile(file);
	document.loadOverlay(overlayFileURI, null);
}
