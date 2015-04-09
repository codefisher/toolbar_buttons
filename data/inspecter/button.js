openDomInspector: function(event, aDocument) {
	var win = event.target.ownerDocument.defaultView;
	try {
		win.inspectDOMDocument(aDocument);
	} catch(e) {
		try {
			win.BrowserToolboxProcess.init();
		} catch(e) {
			toolbar_buttons.wrongVersion(event);
		}
	}
}