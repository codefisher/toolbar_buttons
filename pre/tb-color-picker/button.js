openColorPickerTab: function(event) {
	var url = "chrome://{{chrome_name}}/content/files/colorpicker.xul";
	if(event.button == 1) {
		var browser = window.getBrowser();
		browser.selectedTab = browser.addTab(url);
	}
}

openColorPicker: function() {
	var url = "chrome://{{chrome_name}}/content/files/colorpicker.xul";
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	if(prefs.getBoolPref("colorpicker.intab")) {
		var browser = window.getBrowser();
		browser.selectedTab = browser.addTab(url);
	} else {
		var arguments = {
			color: "#ff0000"
		};
		window.openDialog(url, "ColorPicker", "chrome,centerscreen,dialog=no,resizable", arguments);
	}
}

setUpColorDatabase: function() {
	let file = FileUtils.getFile("ProfD", ["toolbar_buttons.sqlite"]);
	let dbConn = Services.storage.openDatabase(file);
	var statement = dbConn.createAsyncStatement("CREATE TABLE picked_color (name CHAR(6) NOT NULL, time INTEGER NOT NULL)");
	statement.executeAsync({
		handleResult: function(aResultSet) {
		},		
		handleError: function(aError) {
		},		
		handleCompletion: function(aReason) {
			if(aReason == 0) { // if the table existed, it would fail, so it would not be a 0
			}
		}
	});
	statement.finalize();
}

toolbar_buttons.setUpColorDatabase();
