openDomInspector: function(event, aDocument) {
	try {
		window.inspectDOMDocument(aDocument);
	} catch(e) {
		try {
			window.BrowserToolboxProcess.init();
		} catch(e) {
			toolbar_buttons.wrongVersion(event);
		}
	}
}