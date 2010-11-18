profileFolder: function() {
	toolbar_button_interfaces.Properties.get('ProfD', Ci.nsIFile)
		.QueryInterface(Ci.nsILocalFile).launch();
}