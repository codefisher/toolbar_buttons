openExternalApplicationMenu: function(event, aMenu) {
	if(!toolbar_buttons.database_connection) {
		let file = FileUtils.getFile("ProfD", ["toolbar_buttons.sqlite"]);
		toolbar_buttons['database_connection'] = Services.storage.openDatabase(file);
	}
	while(aMenu.firstChild.nodeName != 'menuseparator') {
		aMenu.removeChild(aMenu.firstChild);
	}
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
				.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var empty = stringBundle.GetStringFromName("empty");
  	var menuItem = document.createElement("menuitem");
  	menuItem.setAttribute("label", empty);
  	menuItem.setAttribute("disabled", true);	  	
  	aMenu.insertBefore(menuItem, aMenu.firstChild);
	
	let stmt = toolbar_buttons.database_connection.createStatement("SELECT rowid, name, value FROM external_application_strings ORDER BY name DESC");

	stmt.executeAsync({
	  handleResult: function(aResultSet) {
	  	var count = 0;
	    for (let row = aResultSet.getNextRow();
	         row;
	         row = aResultSet.getNextRow()) {	
			while(aMenu.firstChild.nodeName != 'menuseparator') {
				aMenu.removeChild(aMenu.firstChild);
			}
			let name = row.getResultByName("name");
			let value = row.getResultByName("value");
		  	var menuItem = document.createElement("menuitem");
		  	menuItem.setAttribute("label", name);
		  	menuItem.application = value;
			menuItem.addEventListener("command", toolbar_buttons.runExternalApplication, false);
			aMenu.insertBefore(menuItem, aMenu.firstChild);
			count++;
	    }
	  },	
	  handleError: function(aError) {},	
	  handleCompletion: function(aReason) {}
	});
	stmt.finalize();
}

runExternalApplication: function(event) {
	var command = event.originalTarget.application;
	var appFile = toolbar_buttons.interfaces.LocalFile();
	appFile.initWithPath(command);
	var process = toolbar_buttons.interfaces.Process();
	process.init(appFile);
	process.run(false, [], 0);
}


openExternalApplicationSettings: function() {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
				.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var title = stringBundle.GetStringFromName("tb-external-application.label");
	var arguments = {
		title: title,
		type: "file",
		db_table: "external_application_strings",
	};
	window.openDialog("chrome://{{chrome_name}}/content/files/string-preference.xul",
			"ExternalApplication:Permissions", "chrome,centerscreen,dialog=no,resizable", arguments);
}

toolbar_buttons.setUpStringDatabase("external_application_strings", null);