openMigrateWindow: function(event) {
	var win = event.target.ownerDocument.defaultView;
	win.openDialog("chrome://browser/content/migration/migration.xul",
			"Browser:MigrationWizard", "", null);
}