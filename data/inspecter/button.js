openDomInspector: function(event, aDocument) {
	try {
		inspectDOMDocument(aDocument);
	} catch(e) {
		//TODO: give a more useful prompt.
		toolbar_buttons.wrongVersion(event);
	}
}