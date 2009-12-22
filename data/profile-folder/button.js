profileFolder: function() {
	toolbar_button_interfaces.Properties.get('ProfD', ci.nsIFile)
		.QueryInterface(ci.nsILocalFile).launch();
}