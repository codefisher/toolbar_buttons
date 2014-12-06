setUpStringDatabase: function(tableName, defaultDataFunc) {
	let file = FileUtils.getFile("ProfD", ["toolbar_buttons.sqlite"]);
	let dbConn = Services.storage.openDatabase(file);
	var statement = dbConn.createStatement("CREATE TABLE " + tableName + " (name CHAR(50) NOT NULL, value TEXT NOT NULL)");
	statement.executeAsync({
		handleResult: function(aResultSet) {
		},		
		handleError: function(aError) {
		},		
		handleCompletion: function(aReason) {
			if(aReason == 0 && defaultDataFunc) { // if the table existed, it would fail, so it would not be a 0
				defaultDataFunc();
			}
		}
	});
	statement.finalize();
}
